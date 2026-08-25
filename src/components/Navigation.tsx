"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "LIVE" },
    { href: "/history", label: "HISTORY" },
  ];

  return (
    <nav
      style={{
        fontFamily: '"Courier New", monospace',
        fontSize: "11px",
        padding: "12px 16px",
        borderBottom: "1px solid #1a1a1a",
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        alignItems: "center",
        letterSpacing: "1px",
      }}
    >
      <Link
        href="/"
        style={{
          color: "#666",
          textDecoration: "none",
          marginRight: "8px",
          fontWeight: "bold",
          fontSize: "12px",
        }}
      >
        MONTHLY<span style={{ color: "#cc0000" }}>.</span>LIVE
      </Link>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: pathname === link.href ? "#cc0000" : "#444",
              textDecoration: "none",
              borderBottom:
                pathname === link.href ? "1px solid #cc0000" : "1px solid transparent",
              paddingBottom: "1px",
              transition: "color 0.2s",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
