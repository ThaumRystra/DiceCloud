
export default function aggregateDefinitions({node, linkedNode, link}){
  // Look at all definition links
  if (link.data !== 'definition') return;
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
}

function overrideProp(prop, node){
  if (!prop) return;
  prop.overriden = true;
  if (!node.data.overridenProps) node.data.overridenProps = [];
  node.data.overridenProp.push(prop);
}
