export default function computeToggle(computation, node) {
  const prop = node.data;
  if (!prop.enabled && !prop.disabled && prop.condition && !prop.condition.value) {
    prop.inactive = true;
    prop.deactivatedBySelf = true;
  }
}
