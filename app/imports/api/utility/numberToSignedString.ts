import type { ConstantValueType } from '/imports/parser/parseTree/constant';

export default function numberToSignedString(number: ConstantValueType | undefined, spaced?: boolean) {
  if (typeof number !== 'number') return number;
  if (number === 0) {
    return spaced ? '+ 0' : '+0';
  } else if (number > 0) {
    return spaced ? `+ ${number}` : `+${number}`;
  } else {
    // Uses the unicode minus sign '−' instead of a dash '-' to help line up numbers nicely
    return spaced ? `− ${Math.abs(number) || number}` : `−${Math.abs(number) || number}`;
  }
}
