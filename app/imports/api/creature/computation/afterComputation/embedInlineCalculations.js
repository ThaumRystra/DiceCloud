export default function embedInlineCalculations(string, calculations){
  if (!string) return '';
  if (!calculations) return string;
  let index = 0;
  return string.replace(/\{([^{}]*)\}/g, () => {
    let comp = calculations && calculations[index++];
    return comp && comp.result;
  });
}
