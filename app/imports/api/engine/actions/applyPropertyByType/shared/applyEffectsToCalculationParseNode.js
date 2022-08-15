import operator from '/imports/parser/parseTree/operator.js';
import { parse } from '/imports/parser/parser.js';
import logErrors from './logErrors.js';

export default function applyEffectsToCalculationParseNode(calcObj, actionContext){
  if (!calcObj.effects) return;
  calcObj.effects.forEach(effect => {
    if (effect.operation !== 'add') return;
    if (!effect.amount) return;
    if (effect.amount.value === null) return;
    let effectParseNode;
    try {
      effectParseNode = parse(effect.amount.value.toString());
      calcObj.parseNode = operator.create({
        left: calcObj.parseNode,
        right: effectParseNode,
        operator: '+',
        fn: 'add'
      });
    } catch (e){
      logErrors([e], actionContext)
    }
  });
}
