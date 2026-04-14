export default function valueToCoins(value = 0){
  const totalCopperValue = Math.round(value * 100);
  const copper = totalCopperValue % 10;
  const totalSilverValue = Math.floor(totalCopperValue / 10);
  const silver = (totalSilverValue % 10);
  const totalGoldValue = Math.floor(totalSilverValue / 10);
  return {gp: totalGoldValue, sp: silver, cp: copper};
}
