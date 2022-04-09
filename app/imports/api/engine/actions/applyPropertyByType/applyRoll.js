import applyProperty from '../applyProperty.js';
import logErrors from './shared/logErrors.js';
import applyEffectsToCalculationParseNode from '/imports/api/engine/actions/applyPropertyByType/shared/applyEffectsToCalculationParseNode.js';
import resolve, { toString } from '/imports/parser/resolve.js';

export default function applyRoll(node, {creature, targets, scope, log}){
  const prop = node.node;

  const applyChildren = function(){
    node.children.forEach(child => applyProperty(child, {
      creature, targets, scope, log
    }));
  };

  if (prop.roll?.calculation){
    const logValue = [];

    // roll the dice only and store that string
    applyEffectsToCalculationParseNode(prop.roll, log);
    const {result: rolled, context} = resolve('roll', prop.roll.parseNode, scope);
    if (rolled.parseType !== 'constant'){
      logValue.push(toString(rolled));
    }
    logErrors(context.errors, log);

    // Reset the errors so we don't log the same errors twice
    context.errors = [];

    // Resolve the roll to a final value
    const {result: reduced} = resolve('reduce', rolled, scope, context);
    logErrors(context.errors, log);

    // Store the result
    if (reduced.parseType === 'constant'){
      prop.roll.value = reduced.value;
    } else if (reduced.parseType === 'error'){
      prop.roll.value = null;
    } else {
      prop.roll.value = toString(reduced);
    }

    // If we didn't end up with a constant of finite amount, give up
    if (reduced?.parseType !== 'constant' || !isFinite(reduced.value)){
      return applyChildren();
    }
    const value = reduced.value;

    scope[prop.variableName] = value;
    logValue.push(`**${value}**`);

    if (!prop.silent){
      log.content.push({
        name: prop.name,
        value: logValue.join('\n'),
        inline: true,
      });
    }
  }
  return applyChildren();
}
