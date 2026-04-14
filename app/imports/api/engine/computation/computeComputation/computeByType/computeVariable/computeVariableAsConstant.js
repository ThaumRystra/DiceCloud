import { parse } from '/imports/parser/parser';

export default function computeVariableAsConstant(computation, node, prop) {
  const string = prop.calculation;
  if (!string) return;
  let parseNode;
  try {
    parseNode = parse(string);
  } catch (e) {
    console.error(e);
    return;
  }
  prop.value = parseNode;
}
