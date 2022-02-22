// If we compute this attribute without a variable name, it just
// uses its base value and damage since no effects can target it
// If this attribute does have a variable name, it is recomputed later
// by computeVariableAsAttribute
export default function computeAttribute(computation, node){
  const prop = node.data;
  prop.total = prop.baseValue?.value || 0;
  prop.value = prop.total - (prop.damage || 0);
}
