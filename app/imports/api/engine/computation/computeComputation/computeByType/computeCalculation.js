import call from '/imports/parser/parseTree/call';
import constant from '/imports/parser/parseTree/constant';
import operator from '/imports/parser/parseTree/operator';
import parenthesis from '/imports/parser/parseTree/parenthesis';
import resolve from '/imports/parser/resolve';
import toPrimitiveOrString from '/imports/parser/toPrimitiveOrString';

export default async function computeCalculation(computation, node) {
  const calcObj = node.data;
  if (!calcObj) return;
  // resolve the parse node into the initial value
  await resolveCalculationNode(calcObj, calcObj.parseNode, computation.scope);

  // link the effects and proficiencies
  linkCalculationEffects(node, computation);
  linkCalculationProficiencies(node, computation)

  // Store the unaffected value
  if (calcObj.effectIds || calcObj.proficiencyIds) {
    calcObj.unaffected = toPrimitiveOrString(calcObj.valueNode);
  }

  // Aggregate the effects and proficiencies
  aggregateCalculationEffects(calcObj, id => computation.propsById[id]);
  aggregateCalculationProficiencies(calcObj, id => computation.propsById[id], computation.scope['proficiencyBonus']?.value || 0);

  // Resolve the valueNode after effects and proficiencies have been applied to it
  await resolveCalculationNode(calcObj, calcObj.valueNode, computation.scope);

  // Store the value as a primitive
  calcObj.value = toPrimitiveOrString(calcObj.valueNode);

  // remove the working fields
  delete calcObj._parseLevel;
  delete calcObj._localScope;
}

export async function resolveCalculationNode(calculation, parseNode, scope, givenContext) {
  if (!parseNode) throw new Error('parseNode is required');
  const fn = calculation._parseLevel;
  const calculationScope = { ...calculation._localScope, ...scope };
  const { result: resultNode, context } = await resolve(fn, parseNode, calculationScope, givenContext);
  calculation.errors = context.errors;
  calculation.valueNode = resultNode;
}

function linkCalculationEffects(node, computation) {
  const calcObj = node.data;
  delete calcObj.effectIds;
  computation.dependencyGraph.forEachLinkedNode(
    node.id,
    (linkedNode, link) => {
      // Only effect links
      if (link.data !== 'effect') return;
      // That have effect data
      if (!linkedNode.data) return;
      // Ignore inactive props
      if (linkedNode.data.inactive) return;

      // Collate effects
      calcObj.effectIds = calcObj.effectIds || [];
      calcObj.effectIds.push(linkedNode.data._id);
    },
    true // enumerate only outbound links
  );
}

export function aggregateCalculationEffects(calcObj, getEffectFromId) {
  // dictionary of {[operation]: parseNode}
  const aggregator = {};
  // Store all effect values
  calcObj.effectIds?.forEach(effectId => {
    const effect = getEffectFromId(effectId);
    const op = effect.operation;
    switch (op) {
      case undefined:
        break;
      // Conditionals stored as a list of text
      case 'conditional':
        if (!aggregator[op]) aggregator[op] = [];
        aggregator[op].push(effect.text);
        break;
      // Adv/Dis and Fails just count instances
      case 'advantage':
      case 'disadvantage':
      case 'fail':
        if (calcObj[op] === undefined) calcObj[op] = 0;
        calcObj[op]++;
        break;
      // Math functions store value parseNodes
      case 'base':
      case 'add':
      case 'mul':
      case 'min':
      case 'max':
      case 'set':
        if (!aggregator[op]) aggregator[op] = [];
        aggregator[op].push(effect.amount.valueNode);
        break;
      // No case for passiveAdd, it doesn't make sense in this context
    }
  });
  /**
   * Aggregate the effects in a parse tree like so
   * x = max(...base, unaffectedValue)
   * x = x + sum(...add)
   * x = x * mul(...mul)
   * x = min(...min, x)
   * x = max(...max, x)
   * x = set(last(...set))a
   */
  // Set
  // If we do set, return early, nothing else matters
  if (aggregator.set) {
    calcObj.valueNode = aggregator.set[aggregator.set.length - 1];
    return;
  }
  // Base value
  if (aggregator.base) {
    calcObj.valueNode = call.create({
      functionName: 'max',
      args: [calcObj.valueNode, ...aggregator.base]
    });
  }
  // Add
  aggregator.add?.forEach(node => {
    calcObj.valueNode = operator.create({
      left: calcObj.valueNode,
      right: node,
      operator: '+'
    });
  });
  // Multiply
  if (aggregator.mul) {
    // Wrap the previous node in brackets if it's another operator
    if (calcObj.valueNode.parseType === 'operator') {
      calcObj.valueNode = parenthesis.create({
        content: calcObj.valueNode
      });
    }
    // Append all multiplications
    aggregator.mul.forEach(node => {
      calcObj.valueNode = operator.create({
        left: calcObj.valueNode,
        right: node,
        operator: '*'
      });
    });
  }
  // Min
  if (aggregator.min) {
    calcObj.valueNode = call.create({
      functionName: 'max',
      args: [calcObj.valueNode, ...aggregator.min]
    });
  }
  // Max
  if (aggregator.max) {
    calcObj.valueNode = call.create({
      functionName: 'min',
      args: [calcObj.valueNode, ...aggregator.max]
    });
  }
}

function linkCalculationProficiencies(node, computation) {
  const calcObj = node.data;
  delete calcObj.proficiencyIds;
  delete calcObj.proficiency;

  // Go through all the links and collect them on the calculation
  computation.dependencyGraph.forEachLinkedNode(
    node.id,
    (linkedNode, link) => {
      // Only proficiency links
      if (link.data !== 'proficiency') return;
      // That have data
      if (!linkedNode.data) return;
      // Ignoring inactive props
      if (linkedNode.data.inactive) return;
      // Collate proficiencies
      calcObj.proficiencyIds = calcObj.proficiencyIds || [];
      calcObj.proficiencyIds.push(linkedNode.data._id);
    },
    true // enumerate only outbound links
  );
}

export function aggregateCalculationProficiencies(calcObj, getProficiencyFromId, profBonus) {
  if (!calcObj.proficiencyIds) return;
  // Apply the highest proficiency, marking all others as overridden
  calcObj.proficiency = 0;
  calcObj.proficiencyBonus = 0;
  let currentProf;
  calcObj.proficiencyIds.forEach(profId => {
    const profProp = getProficiencyFromId(profId)
    if (!profProp) {
      console.warn('proficiency linked but not found ', profId);
    }
    // Compute the proficiency and value
    let proficiency, value;
    if (profProp.type === 'proficiency') {
      proficiency = profProp.value || 0;
      // Multiply the proficiency bonus by the actual proficiency
      if (proficiency === 0.49) {
        // Round down proficiency bonus in the special case
        value = Math.floor(profBonus * 0.5);
      } else {
        value = Math.ceil(profBonus * proficiency);
      }
    } else if (profProp.type === 'skill') {
      value = profProp.value || 0;
      proficiency = profProp.proficiency || 0;
    }
    if (value > calcObj.proficiencyBonus) {
      if (currentProf) currentProf.overridden = true;
      calcObj.proficiencyBonus = value;
      calcObj.proficiency = proficiency;
      currentProf = profProp;
    } else {
      profProp.overridden = true;
    }
  });
  calcObj.valueNode = operator.create({
    left: calcObj.valueNode,
    right: constant.create({ value: calcObj.proficiencyBonus }),
    operator: '+'
  });
}
