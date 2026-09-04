const GEN_KEY = "monthly:gate-gen";

/** Session generation this browser was signed in with, or null when unknown. */
export function readGateSessionGeneration(): number | null {
  try {
    const raw = localStorage.getItem(GEN_KEY);
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeGateSessionGeneration(generation: number | null): void {
  try {
    if (generation === null) localStorage.removeItem(GEN_KEY);
    else localStorage.setItem(GEN_KEY, String(generation));
  } catch {
    // Ignore storage failures
  }
}
