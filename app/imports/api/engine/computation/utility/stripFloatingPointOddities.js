export default function stripFloatingPointOddities(num, precision = 12) {
  return +parseFloat(num.toPrecision(precision))
}

export function safeStrip(num, precision = 12) {
  if (!Number.isFinite(num)) return num;
  return stripFloatingPointOddities(num, precision);
}
