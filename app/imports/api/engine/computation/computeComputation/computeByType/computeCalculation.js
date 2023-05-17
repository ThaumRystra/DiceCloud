import evaluateCalculation from '../../utility/evaluateCalculation.js';

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
  computation.dependencyGraph.forEachLinkedNode(
    node.id,
    (linkedNode, link) => {
      // Only proficiency links
      if (link.data !== 'proficiency') return;
      // That have data
      if (!linkedNode.data) return;
      // Ignore inactive props
      if (linkedNode.data.inactive) return;
      // Collate proficiencies
      calcObj.proficiencies = calcObj.proficiencies || [];
      calcObj.proficiencies.push({
        _id: linkedNode.data._id,
        name: linkedNode.data.name,
        value: linkedNode.data.value,
      });
    },
    true // enumerate only outbound links
  );
  if (calcObj.proficiencies && typeof calcObj.value === 'number') {
    calcObj.proficiency = 0;
    let currentProf;
    calcObj.proficiencies.forEach(prof => {
      if (prof.value > calcObj.proficiency) {
        if (currentProf) currentProf.overridden = true;
        calcObj.proficiency = prof.value;
      } else {
        prof.overridden = true;
      }
    });
    // Get the character's proficiency bonus to apply
    let profBonus = computation.scope['proficiencyBonus']?.value || 0;
    calcObj.proficiencyBonus = profBonus;
    let totalBonus;
    // Multiply the proficiency bonus by the actual proficiency
    if (calcObj.proficiency === 0.49) {
      // Round down proficiency bonus in the special case
      totalBonus = Math.floor(profBonus * 0.5);
    } else {
      totalBonus = Math.ceil(profBonus * calcObj.proficiency);
    }
    calcObj.value += totalBonus;
  }
}
