export function asString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : undefined;
  }

  return typeof value === 'string' ? value : undefined;
}

export function requireString(value: unknown, label: string): string {
  const resolved = asString(value);
  if (!resolved) {
    throw new Error(`${label} is required`);
  }

  return resolved;
}