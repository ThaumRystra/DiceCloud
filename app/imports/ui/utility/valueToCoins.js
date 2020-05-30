export default function valueToCoins(value = 0){
  let totalCopperValue = Math.round(value * 100);
  let copper = totalCopperValue % 10;
  let totalSilverValue = Math.floor(totalCopperValue / 10);
  let silver = (totalSilverValue % 10);
  let totalGoldValue = Math.floor(totalSilverValue / 10);
  return {gp: totalGoldValue, sp: silver, cp: copper};
}
