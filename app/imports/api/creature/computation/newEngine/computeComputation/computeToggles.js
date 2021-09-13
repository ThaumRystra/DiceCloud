export default function evaluateToggles(node){
  let prop = node.data;
  let toggles = prop._computationDetails?.toggleAncestors;
  if (!toggles) return;
  toggles.forEach(toggle => {
    if (prop.inactive || !toggle.condition) return;
    if (!toggle.condition.value){
      prop.inactive = true;
      prop.deactivatedByToggle = true;
    }
  });
}
