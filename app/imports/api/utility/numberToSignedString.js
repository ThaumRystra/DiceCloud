export default function numberToSignedString(number, spaced){
  if (typeof number !== 'number') return number;
  if (number === 0){
    return spaced ? '+ 0' : '+0';
  } else if (number > 0){
    return spaced ? `+ ${number}` : `+${number}`;
  } else {
    return spaced ? `- ${Math.abs(number) || number}` : `${number}`;
  }
}
