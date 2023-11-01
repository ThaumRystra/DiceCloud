import evaluateCalculation from '../../utility/evaluateCalculation.js';
import call from '/imports/parser/parseTree/call.js';
import constant from '/imports/parser/parseTree/constant.js';
import operator from '/imports/parser/parseTree/operator.js';
import parenthesis from '/imports/parser/parseTree/parenthesis.js';
import { toString } from '/imports/parser/resolve.js';

export default function computeCalculation(computation, node) {
  const calcObj = node.data;
  evaluateCalculation(calcObj, computation.scope);
  if (calcObj.effects || calcObj.proficiencies) {
    calcObj.unaffected = calcObj.value;
    calcObj.displayUnaffected = toString(calcObj.unaffected);
  }
  aggregateCalculationEffects(node, computation);
  aggregateCalculationProficiencies(node, computation);
  calcObj.displayValue = toString(calcObj.value);
}

function aggregateCalculationEffects(node, computation) {
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
  if (calcObj.effectIds) {
    // dictionary of {[operation]: parseNode}
    const aggregator = {};
    // Store all effect values
    calcObj.effects.forEach(effect => {
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
          aggregator[op].push(effect.amount.value);
          break;
        // No case for passiveAdd, it doesn't make sense in this context
      }
    });
    /**
     * Aggregate the effects in a parse tree like so
     * x = ( max(...base, unaffectedValue) + sum(...add) ) * mul(...mul)
     * min(...min, x)
     * max(...max, x)
     * set(last(...set))a
     */
    // Set
    // If we do set, return early, nothing else matters
    if (aggregator.set) {
      calcObj.value = aggregator.set[aggregator.set.length - 1];
      return;
    }
    // Base value
    if (aggregator.base) {
      calcObj.value = call.create({
        functionName: 'max',
        args: [calcObj.value, aggregator.base]
      });
    }
    // Add
    aggregator.add?.forEach(node => {
      calcObj.value = operator.create({
        left: calcObj.value,
        right: node,
        operator: '+'
      });
    });
    // Multiply
    if (aggregator.mul) {
      // Wrap the previous node in brackets if it's another operator
      if (calcObj.parseType === 'operator') {
        calcObj.value = parenthesis.create({
          content: calcObj.value
        });
      }
      // Append all multiplications
      aggregator.mul.forEach(node => {
        calcObj.value = operator.create({
          left: calcObj.value,
          right: node,
          operator: '*'
        });
      });
    }
    // Min
    if (aggregator.min) {
      calcObj.value = call.create({
        functionName: 'max',
        args: [calcObj.value, aggregator.min]
      });
    }
    // Max
    if (aggregator.max) {
      calcObj.value = call.create({
        functionName: 'min',
        args: [calcObj.value, aggregator.max]
      });
    }
  }
}

function aggregateCalculationProficiencies(node, computation) {
  const calcObj = node.data;
  delete calcObj.proficiencies;
  delete calcObj.proficiency;
  let profBonus = computation.scope['proficiencyBonus']?.value || 0;

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
      // Compute the proficiency and value
      let proficiency, value;
      if (linkedNode.data.type === 'proficiency') {
        proficiency = linkedNode.data.value || 0;
        // Multiply the proficiency bonus by the actual proficiency
        if (proficiency === 0.49) {
          // Round down proficiency bonus in the special case
          value = Math.floor(profBonus * 0.5);
        } else {
          value = Math.ceil(profBonus * proficiency);
        }
      } else if (linkedNode.data.type === 'skill') {
        value = linkedNode.data.value || 0;
        proficiency = linkedNode.data.proficiency || 0;
      }
      // Collate proficiencies
      calcObj.proficiencies = calcObj.proficiencies || [];
      calcObj.proficiencies.push({
        _id: linkedNode.data._id,
        name: linkedNode.data.name,
        type: linkedNode.data.type,
        proficiency,
        value,
      });
    },
    true // enumerate only outbound links
  );

  // Apply the highest proficiency, marking all others as overridden
  if (calcObj.proficiencies && typeof calcObj.value === 'number') {
    calcObj.proficiency = 0;
    calcObj.proficiencyBonus = 0;
    let currentProf;
    calcObj.proficiencies.forEach(prof => {
      if (prof.value > calcObj.proficiencyBonus) {
        if (currentProf) currentProf.overridden = true;
        calcObj.proficiencyBonus = prof.value;
        calcObj.proficiency = prof.proficiency;
        currentProf = prof;
      } else {
        prof.overridden = true;
      }
    });
    calcObj.value = operator.create({
      left: calcObj.value,
      right: constant.create({ value: calcObj.proficiencyBonus }),
      operator: '+'
    });
  }
}
