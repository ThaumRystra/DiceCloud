import applyChildren from '/imports/api/engine/actions/applyPropertyByType/shared/applyChildren.js';
import logErrors from './shared/logErrors.js';
import applyEffectsToCalculationParseNode from '/imports/api/engine/actions/applyPropertyByType/shared/applyEffectsToCalculationParseNode.js';
import resolve, { toString } from '/imports/parser/resolve.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';

export default function applyRoll(node, actionContext) {
  applyNodeTriggers(node, 'before', actionContext);
  const prop = node.node;

  if (prop.roll?.calculation) {
    const logValue = [];

    // roll the dice only and store that string
    applyEffectsToCalculationParseNode(prop.roll, actionContext);
    const { result: rolled, context } = resolve('roll', prop.roll.parseNode, actionContext.scope);
    if (rolled.parseType !== 'constant') {
      logValue.push(toString(rolled));
    }
    logErrors(context.errors, actionContext);

    // Reset the errors so we don't log the same errors twice
    context.errors = [];

    // Resolve the roll to a final value
    const { result: reduced } = resolve('reduce', rolled, actionContext.scope, context);
    logErrors(context.errors, actionContext);

    // Store the result
    if (reduced.parseType === 'constant') {
      prop.roll.value = reduced.value;
    } else if (reduced.parseType === 'error') {
      prop.roll.value = null;
    } else {
      prop.roll.value = toString(reduced);
    }

    // If we didn't end up with a constant or a number of finite value, give up
    if (reduced?.parseType !== 'constant' || (reduced.valueType === 'number' && !isFinite(reduced.value))) {
      return applyChildren(node, actionContext);
    }
    const value = reduced.value;

    actionContext.scope[prop.variableName] = { value };
    logValue.push(`**${value}**`);

    if (!prop.silent) {
      actionContext.addLog({
        name: prop.name,
        value: logValue.join('\n'),
        inline: true,
      });
    }
  }
  return applyChildren(node, actionContext);
}
