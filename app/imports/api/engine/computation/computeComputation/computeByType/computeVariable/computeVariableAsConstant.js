import { parse } from '/imports/parser/parser.js';

export default function computeVariableAsConstant(computation, node, prop){
  let string = prop.calculation;
  if (!string) return;
  let parseNode;
  try {
    parseNode = parse(string);
  } catch (e) {
    return;
  }
  prop.value = parseNode;
}
