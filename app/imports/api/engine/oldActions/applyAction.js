import spendResources from '/imports/api/creature/actions/spendResources.js'

export default function applyAction({prop, log}){
  let content = { name: prop.name };
  /*
  if (prop.summary){
    content.value = embedInlineCalculations(
      prop.summary, prop.summaryCalculations
    );
  }*/
  log.content.push(content);
  spendResources({prop, log});
}
