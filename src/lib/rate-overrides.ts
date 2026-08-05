// Shared mutable rate override store (client-side only)
// Rate Configuration writes here; Business Information reads from here.

const overrides: Record<string, number> = {};
const ceilingOverrides: Record<string, number> = {};

export function getRateOverride(code: string): number | undefined {
  return overrides[code];
}

export function setRateOverride(code: string, amount: number): void {
  overrides[code] = amount;
}

export function deleteRateOverride(code: string): void {
  delete overrides[code];
}

export function getAllOverrides(): Record<string, number> {
  return { ...overrides };
}

export function hasAnyOverride(): boolean {
  return Object.keys(overrides).length > 0;
}

// ── Ceiling overrides ────────────────────────────────────────────────────────

export function getCeilingOverride(code: string): number | undefined {
  return ceilingOverrides[code];
}

export function setCeilingOverride(code: string, ceiling: number): void {
  ceilingOverrides[code] = ceiling;
}

export function deleteCeilingOverride(code: string): void {
  delete ceilingOverrides[code];
}

export function getAllCeilingOverrides(): Record<string, number> {
  return { ...ceilingOverrides };
}
