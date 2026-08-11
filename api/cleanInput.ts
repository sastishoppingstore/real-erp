export function cleanInput(input: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );
}
