"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";

interface StreamPlayerProps {
  isLive: boolean;
  streamUrl: string;
}

export default function StreamPlayer({ isLive, streamUrl }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [useGif, setUseGif] = useState(false);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Handle static video (offline state)
  useEffect(() => {
    if (isLive) return;
    const video = videoRef.current;
    if (!video) return;

    destroyHls();
    setUseGif(false);
    video.src = "/assets/static.mp4";
    video.loop = true;
    video.muted = true;
    video.play().catch(() => {});
    // If mp4 missing, try gif
    video.onerror = () => {
      video.onerror = null;
      setUseGif(true);
    };
  }, [isLive, destroyHls]);

  // Handle live stream
  useEffect(() => {
    if (!isLive || !streamUrl) return;
    const video = videoRef.current;
    if (!video) return;

    destroyHls();
    setError(false);

    if (streamUrl.includes(".m3u8") && Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 6,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError(true);
          destroyHls();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari)
      video.src = streamUrl;
      video.play().catch(() => {});
    } else if (streamUrl.includes(".m3u8")) {
      setError(true);
    } else {
      // Direct video URL
      video.src = streamUrl;
      video.play().catch(() => {});
    }

    return () => {
      destroyHls();
    };
  }, [isLive, streamUrl, destroyHls]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", background: "#000" }}>
      {/* CRT scanlines over video */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
          background: `repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.12) 0px,
            rgba(0,0,0,0.12) 1px,
            transparent 1px,
            transparent 2px
          )`,
        }}
      />

      {/* Video element */}
      {(!isLive && useGif) ? (
        <img
          src="/assets/static.gif"
          style={{
            width: "100%",
            display: "block",
            background: "#000",
            aspectRatio: "16/9",
            objectFit: "contain",
          }}
        />
      ) : (
        <video
          ref={videoRef}
          muted={isMuted}
          playsInline
          autoPlay
          loop={!isLive}
          style={{
            width: "100%",
            display: "block",
            background: "#000",
            aspectRatio: "16/9",
            objectFit: "contain",
          }}
        />
      )}

      {/* Error state */}
      {error && isLive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            zIndex: 3,
          }}
        >
          <div
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: "12px",
              color: "#cc0000",
              textAlign: "center",
            }}
          >
            signal lost
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "8px 12px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
          zIndex: 4,
          opacity: 0,
          transition: "opacity 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0";
        }}
      >
        <button
          onClick={togglePlay}
          style={{
            background: "transparent",
            border: "none",
            color: "#888",
            fontFamily: '"Courier New", monospace',
            fontSize: "11px",
            padding: "2px 4px",
            cursor: "pointer",
          }}
        >
          {isPlaying ? "[ pause ]" : "[ play ]"}
        </button>

        <button
          onClick={toggleMute}
          style={{
            background: "transparent",
            border: "none",
            color: isMuted ? "#cc0000" : "#888",
            fontFamily: '"Courier New", monospace',
            fontSize: "11px",
            padding: "2px 4px",
            cursor: "pointer",
          }}
        >
          {isMuted ? "[ unmute ]" : "[ mute ]"}
        </button>

        <button
          onClick={toggleFullscreen}
          style={{
            background: "transparent",
            border: "none",
            color: "#888",
            fontFamily: '"Courier New", monospace',
            fontSize: "11px",
            padding: "2px 4px",
            cursor: "pointer",
          }}
        >
          [ fullscreen ]
        </button>
      </div>

      {/* Touch controls for mobile */}
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          right: "12px",
          display: "flex",
          gap: "8px",
          zIndex: 4,
        }}
        className="mobile-controls"
      >
        <button
          onClick={toggleMute}
          style={{
            background: "rgba(0,0,0,0.6)",
            border: "1px solid #333",
            color: isMuted ? "#cc0000" : "#888",
            fontFamily: '"Courier New", monospace',
            fontSize: "10px",
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>

        <button
          onClick={toggleFullscreen}
          style={{
            background: "rgba(0,0,0,0.6)",
            border: "1px solid #333",
            color: "#888",
            fontFamily: '"Courier New", monospace',
            fontSize: "10px",
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          ⛶
        </button>
      </div>

      <style>{`
        .mobile-controls { display: none; }
        @media (hover: none) and (pointer: coarse) {
          .mobile-controls { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
