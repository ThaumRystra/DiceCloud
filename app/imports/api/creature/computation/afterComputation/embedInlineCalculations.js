import INLINE_CALCULATION_REGEX from '/imports/constants/INLINE_CALCULTION_REGEX.js';

export default function embedInlineCalculations(string, calculations){
  if (!string) return '';
  if (!calculations) return string;
  let index = 0;
  return string.replace(INLINE_CALCULATION_REGEX, () => {
    let comp = calculations && calculations[index++];
    return comp && comp.result ? comp.result : string;
  });
}
