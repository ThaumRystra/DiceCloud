import spendResources from '/imports/api/creature/actions/spendResources.js'
import {insertCreatureLog} from '/imports/api/creature/log/CreatureLogs.js';

export default function applyAction({prop, creature}){
  spendResources(prop);
  insertCreatureLog.call({
    log: prop.name,
    creatureId: creature._id,
  });
}
