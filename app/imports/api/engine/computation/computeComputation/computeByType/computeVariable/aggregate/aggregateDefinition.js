
export default function aggregateDefinition({ node, linkedNode, link }) {
  // Look at all definition links
  if (link.data !== 'definition') return;

  // Store which property is THE defining property and which are overridden
  const prop = linkedNode.data;
  // get current defining prop
  const definingProp = node.data.definingProp;
  // Find the last defining prop
  if (
    !definingProp ||
    prop.type !== 'pointBuyRow' && (
      definingProp.type === 'pointBuyRow' ||
      prop.left > definingProp.left
    )
  ) {
    // override the current defining prop
    overrideProp(definingProp, node);
    // set this prop as the new defining prop
    node.data.definingProp = prop;
  } else {
    overrideProp(prop, node);
  }

  // Aggregate the base value due to the defining properties
  let propBaseValue = prop.baseValue?.value;
  // Point buy rows use prop.value instead of prop.baseValue
  if (prop.type === 'pointBuyRow') {
    propBaseValue = prop.value;
  }

  if (propBaseValue === undefined) return;
  // Store a summary of the definition as a base value effect
  node.data.definitions = node.data.definitions || [];

  if (prop.type === 'pointBuyRow') {
    node.data.definitions.push({ _id: prop.tableId, type: 'pointBuy', row: prop.index });
  } else {
    node.data.definitions.push({ _id: prop._id, type: node.data.type });
  }
  if (node.data.baseValue === undefined || propBaseValue > node.data.baseValue) {
    node.data.baseValue = propBaseValue;
  }
}

function overrideProp(prop, node) {
  if (!prop) return;
  prop.overridden = true;
  if (!node.data.overriddenProps) node.data.overriddenProps = [];
  node.data.overriddenProps.push(prop);
}
