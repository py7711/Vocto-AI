export function jsonStringifySafe(value: unknown) {
  return JSON.stringify(value, (_key, item) => (typeof item === "bigint" ? item.toString() : item));
}

export function jsonSafe<T>(value: T): T {
  return JSON.parse(jsonStringifySafe(value)) as T;
}
