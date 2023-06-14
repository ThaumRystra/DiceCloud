import evaluateCalculation from '../../utility/evaluateCalculation.js';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';

export default function computeCalculation(computation, node) {
  const calcObj = node.data;
  evaluateCalculation(calcObj, computation.scope);
  if (calcObj.effects || calcObj.proficiencies) {
    calcObj.baseValue = calcObj.value;
  }
  aggregateCalculationEffects(node, computation);
  aggregateCalculationProficiencies(node, computation);
}

function aggregateCalculationEffects(node, computation) {
  const calcObj = node.data;
  delete calcObj.effects;
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
      calcObj.effects = calcObj.effects || [];
      calcObj.effects.push({
        _id: linkedNode.data._id,
        name: linkedNode.data.name,
        operation: linkedNode.data.operation,
        amount: linkedNode.data.amount && {
          value: linkedNode.data.amount.value,
          //parseNode: linkedNode.data.amount.parseNode,
        },
        // ancestors: linkedNode.data.ancestors,
      });
    },
    true // enumerate only outbound links
  );
  if (calcObj.effects && typeof calcObj.value === 'number') {
    calcObj.effects.forEach(effect => {
      if (
        effect.operation === 'add' &&
        effect.amount && typeof effect.amount.value === 'number'
      ) {
        calcObj.value += effect.amount.value
      }
    });
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
    calcObj.value += calcObj.proficiencyBonus;
  }
}
