
export default function aggregateEventDefinition({ node, linkedNode, link }) {
  // Look at all event definition links
  if (link.data !== 'eventDefinition') return;

  // Store which property is THE defining event and which are overridden
  const prop = linkedNode.data;
  // get current defining event
  const definingEvent = node.data.definingEvent;
  // Find the last defining event
  if (
    !definingEvent ||
    prop.left > definingEvent.left
  ) {
    // override the current defining prop
    if (definingEvent) definingEvent.overridden = true;
    // set this prop as the new defining prop
    node.data.definingEvent = prop;
  } else {
    prop.overridden = true;
  }
}
