export default function embedInlineCalculations(string, calculations){
  if (!string) return '';
  let index = 0;
  return string.replace(/\{([^{}]*)\}/g, () => {
    let comp = calculations && calculations[index++];
    return comp && comp.result;
  });
}
