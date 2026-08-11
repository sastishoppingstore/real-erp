export function serialize(value: unknown): { json: unknown; meta: { values: Record<string, string[]>; v: number } } {
  const values: Record<string, string[]> = {};
  const json = walk(value, [], values);
  return { json, meta: { values, v: 1 } };
}

function walk(value: unknown, path: string[], values: Record<string, string[]>): unknown {
  if (value instanceof Date) {
    values[path.join(".")] = ["Date"];
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((v, i) => walk(v, [...path, String(i)], values));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = walk(v, [...path, k], values);
    }
    return out;
  }
  return value;
}

export function deserialize(json: unknown, values?: Record<string, string[]>): unknown {
  if (!values) return json;
  return dewalk(json, [], values);
}

function dewalk(value: unknown, path: string[], values: Record<string, string[]>): unknown {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const key = path.join(".");
    if (values[key]?.includes("Date") && typeof value === "string") {
      return new Date(value as string);
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = dewalk(v, [...path, k], values);
    }
    return out;
  }
  if (Array.isArray(value)) {
    return value.map((v, i) => dewalk(v, [...path, String(i)], values));
  }
  return value;
}
