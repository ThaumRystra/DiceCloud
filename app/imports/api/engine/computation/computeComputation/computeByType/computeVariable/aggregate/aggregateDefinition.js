
export default function aggregateDefinition({node, linkedNode, link}){
  // Look at all definition links
  if (link.data !== 'definition') return;

  // Store which property is THE defining property and which are overridden
  const prop = linkedNode.data;
  // get current defining prop
  const definingProp = node.data.definingProp;
  // Find the last defining prop
  if (!definingProp || prop.order > definingProp.order){
    // override the current defining prop
    overrideProp(definingProp, node);
    // set this prop as the new defining prop
    node.data.definingProp = prop;
  } else {
    overrideProp(prop, node);
  }

  // Aggregate the base value due to the defining properties
  const propBaseValue = prop.baseValue?.value;

  if (propBaseValue === undefined) return;
  if (node.data.baseValue === undefined || propBaseValue > node.data.baseValue){
    node.data.baseValue = propBaseValue;
  }
}

function overrideProp(prop, node){
  if (!prop) return;
  prop.overridden = true;
  if (!node.data.overriddenProps) node.data.overriddenProps = [];
  node.data.overriddenProps.push(prop);
}
