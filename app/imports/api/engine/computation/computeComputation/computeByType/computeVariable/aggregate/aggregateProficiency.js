export default function aggregateProficiency({node, linkedNode, link}){
  if (
    link.data !== 'proficiency' &&
    !(link.data === 'definition' && linkedNode.data.type === 'skill')
  ) return;
  let proficiency;
  if (link.data === 'proficiency'){
    proficiency = linkedNode.data.value || 0;
  } else if (link.data === 'definition' && linkedNode.data.type === 'skill'){
    proficiency = linkedNode.data.baseProficiency || 0;
  } else {
    return;
  }
  // Store the highest proficiency
  if (
    node.data.proficiency === undefined ||
    proficiency > node.data.proficiency
  ){
    node.data.proficiency = proficiency;
  }
}
