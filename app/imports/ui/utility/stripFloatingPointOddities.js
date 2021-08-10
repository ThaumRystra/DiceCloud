export default function stripFloatingPointOddities(num, precision = 12){
  return +parseFloat(num.toPrecision(precision))
}
