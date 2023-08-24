export default function evaluateToggles(computation, node) {
  let prop = node.data;
  if (!prop) return;
  let toggles = prop._computationDetails?.toggleAncestors;
  if (!toggles) return;
  toggles.forEach(toggle => {
    if (
      (
        // Toggle isn't set to constantly enabled or disabled
        !toggle.enabled &&
        !toggle.disabled &&
        // Toggle is not disabled by another toggle targeting it
        // Ancestor toggles would've handled this child anyway,
        // and tag targeted toggles break the link
        !toggle.deactivatedByToggle &&
        !toggle.deactivatedByAncestor &&
        // Toggle has a condition with a falsy value
        toggle.condition &&
        !toggle.condition.value
      )
      || (
        // Toggle is disabled manually
        toggle.disabled &&
        // Toggle isn't deactivated by something else
        !toggle.deactivatedByToggle &&
        !toggle.deactivatedByAncestor
      )
    ) {
      prop.inactive = true;
      prop.deactivatedByToggle = true;
      prop.deactivatingToggleId = toggle._id;
    }
  });
}
