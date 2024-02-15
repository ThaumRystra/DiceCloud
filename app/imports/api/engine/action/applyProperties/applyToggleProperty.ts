// TODO

export default function applyToggle(node, actionContext) {
  applyNodeTriggers(node, 'before', actionContext);
  const prop = node.doc
  recalculateCalculation(prop.condition, actionContext);
  if (prop.condition?.value) {
    return applyChildren(node, actionContext);
  }
}
