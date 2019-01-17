export default function numberToSignedString(number){
  if (typeof number !== 'number') return number;
  if (number === 0){
    return '+0';
  } else if (number > 0){
    return `+${number}`;
  } else {
    return `${number}`;
  }
};
