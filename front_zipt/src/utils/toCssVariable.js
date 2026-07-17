export function toCssVariable(value) {
  return typeof value === "number" ? `${value}px` : value;
}
