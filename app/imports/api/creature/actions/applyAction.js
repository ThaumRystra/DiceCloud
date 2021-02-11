import spendResources from '/imports/api/creature/actions/spendResources.js'

export default function applyAction({prop, log}){
  spendResources(prop);
  // If this is not the top level action, we can add its name to the log
  if (log.content.length){
    log.content.push({name: prop.name});
  }
}
