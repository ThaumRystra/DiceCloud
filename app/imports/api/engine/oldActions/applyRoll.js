import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';

export default function applyRoll({
  prop,
  creature,
  actionContext,
  log,
}){
  let scope = {
    ...creature.variables,
    ...actionContext,
  };
  var {result} = evaluateString({
    string: prop.roll,
    scope,
    fn: 'reduce'
  });
  if (result.isNumber){
    actionContext[prop.variableName] = result.value;
  }
  log.content.push({
    name: prop.name,
    value: prop.variableName + ' = ' + prop.roll + ' = ' + result.toString(),
  });
}
