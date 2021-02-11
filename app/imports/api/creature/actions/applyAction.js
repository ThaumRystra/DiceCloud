import spendResources from '/imports/api/creature/actions/spendResources.js'
import embedInlineCalculations from '/imports/api/creature/computation/afterComputation/embedInlineCalculations.js';

export default function applyAction({prop, log}){
  spendResources(prop);
  // If this is not the top level action, we can add its name to the log
  if (log.content.length){
    log.content.push({name: prop.name});
  }
  if (prop.summary){
    log.content.push({
      details: embedInlineCalculations(
        prop.summary, prop.summaryCalculations
      ),
    });
  }
  if (prop.description){
    log.content.push({
      details: embedInlineCalculations(
        prop.description, prop.descriptionCalculations
      ),
    });
  }
}
