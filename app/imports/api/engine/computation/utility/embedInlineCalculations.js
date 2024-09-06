import INLINE_CALCULATION_REGEX from '/imports/constants/INLINE_CALCULATION_REGEX';

export default function embedInlineCalculations(inlineCalcObj) {
  const string = inlineCalcObj.text;
  const calculations = inlineCalcObj.inlineCalculations;
  if (!string || !calculations) return;
  let index = 0;
  inlineCalcObj.value = string.replace(INLINE_CALCULATION_REGEX, substring => {
    let calc = calculations[index++];
    return (calc && 'value' in calc) ? calc.value : substring;
  });
}
