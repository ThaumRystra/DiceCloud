export default function evaluateToggles(computation, node) {
  let prop = node.data;
  if (!prop) return;
  let toggles = prop._computationDetails?.toggleAncestors;
  if (!toggles) return;
  toggles.forEach(toggle => {
    if (
      (!toggle.enabled && !toggle.disabled && toggle.condition && !toggle.condition.value)
      || (toggle.disabled)
    ) {
      prop.inactive = true;
      prop.deactivatedByToggle = true;
      prop.deactivatingToggleId = toggle._id;
    }
  });
}
