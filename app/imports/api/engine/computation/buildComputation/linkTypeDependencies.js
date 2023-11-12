import { get, intersection, difference, union } from 'lodash';

const linkDependenciesByType = {
  action: linkAction,
  adjustment: linkAdjustment,
  attribute: linkAttribute,
  branch: linkBranch,
  buff: linkBuff,
  class: linkVariableName,
  classLevel: linkClassLevel,
  constant: linkVariableName,
  damage: linkDamage,
  damageMultiplier: linkDamageMultiplier,
  effect: linkEffects,
  proficiency: linkProficiencies,
  roll: linkRoll,
  pointBuy: linkPointBuy,
  propertySlot: linkSlot,
  skill: linkSkill,
  spell: linkAction,
  spellList: linkSpellList,
  savingThrow: linkSavingThrow,
  toggle: linkToggle,
}

export default function linkTypeDependencies(dependencyGraph, prop, computation) {
  linkDependenciesByType[prop.type]?.(dependencyGraph, prop, computation);
}

function dependOnCalc({ dependencyGraph, prop, key }) {
  let calc = get(prop, key);
  if (!calc?.type) return;
  if (calc.type !== '_calculation') {
    throw `Failed to dependOnCal for prop: ${prop._id}, key: ${key}. Expected calculation got ${calc.type}`
  }
  dependencyGraph.addLink(prop._id, `${prop._id}.${key}`, 'calculation');
}

function linkAction(dependencyGraph, prop, { propsById }) {
  if (prop.variableName) {
    dependencyGraph.addLink(prop.variableName, prop._id, 'eventDefinition');
  }
  // The action depends on its attack roll and uses calculations
  dependOnCalc({ dependencyGraph, prop, key: 'attackRoll' });
  dependOnCalc({ dependencyGraph, prop, key: 'uses' });

  // Link the resources the action uses
  if (!prop.resources) return;
  // Link items consumed
  prop.resources.itemsConsumed.forEach((itemConsumed, index) => {
    if (!itemConsumed.itemId) return;
    const item = propsById[itemConsumed.itemId];
    if (!item || item.inactive) {
      // Unlink if the item doesn't exist or is inactive
      itemConsumed.itemId = undefined;
      return;
    }
    // none of these dependencies are computed, we can use them immediately
    itemConsumed.available = item.quantity;
    itemConsumed.itemName = item.name;
    itemConsumed.itemIcon = item.icon;
    itemConsumed.itemColor = item.color;
    dependencyGraph.addLink(prop._id, item._id, 'inventory');
    // Link the property to its resource quantity calculation

    dependOnCalc({
      dependencyGraph,
      prop,
      key: `resources.itemsConsumed[${index}].quantity`,
    });
  });
  // Link attributes consumed
  prop.resources.attributesConsumed.forEach((attConsumed, index) => {
    if (!attConsumed.variableName) return;
    dependencyGraph.addLink(prop._id, attConsumed.variableName, 'resource');
    // Link the property to its resource quantity calculation
    dependOnCalc({
      dependencyGraph,
      prop,
      key: `resources.attributesConsumed[${index}].quantity`,
    });
  });
  // Link conditions
  prop.resources.conditions?.forEach((con, index) => {
    // Link the property to its condition calculation
    dependOnCalc({
      dependencyGraph,
      prop,
      key: `resources.conditions[${index}].condition`,
    });
  });
}

function linkAdjustment(dependencyGraph, prop) {
  // Adjustment depends on its amount
  dependOnCalc({ dependencyGraph, prop, key: 'amount' });
}

function linkAttribute(dependencyGraph, prop) {
  linkVariableName(dependencyGraph, prop);
  // Spell slots depend on spellSlotLevel
  if (prop.type === 'spellSlot') {
    dependOnCalc({ dependencyGraph, prop, key: 'spellSlotLevel' });
  }

  // Depends on base value
  dependOnCalc({ dependencyGraph, prop, key: 'baseValue' });

  // hit dice depend on constitution
  if (prop.attributeType === 'hitDice') {
    dependencyGraph.addLink(prop._id, 'constitution', 'hitDiceConMod');
  }
}

function linkBranch(dependencyGraph, prop) {
  dependOnCalc({ dependencyGraph, prop, key: 'condition' });
}

function linkBuff(dependencyGraph, prop) {
  dependOnCalc({ dependencyGraph, prop, key: 'duration' });
}

function linkClassLevel(dependencyGraph, prop) {
  if (prop.inactive) return;
  // The variableName of the prop depends on the prop
  if (prop.variableName && prop.level) {
    dependencyGraph.addLink(prop.variableName, prop._id, 'classLevel');
    // The level variable depends on the class variableName variable
    let existingLevelLink = dependencyGraph.getLink('level', prop.variableName);
    if (!existingLevelLink) {
      dependencyGraph.addLink('level', prop.variableName, 'level');
    }
  }
}

function linkDamage(dependencyGraph, prop) {
  dependOnCalc({ dependencyGraph, prop, key: 'amount' });
}

function linkEffects(dependencyGraph, prop, computation) {
  // The effect depends on its amount calculation
  dependOnCalc({ dependencyGraph, prop, key: 'amount' });
  // Inactive effects aren't going to impact their targeted stats
  if (prop.inactive) return;
  // The stats depend on the effect
  if (prop.inactive) {
    // Inactive effects apply to no stats
    return;
  } else if (prop.targetByTags) {
    getEffectTagTargets(prop, computation).forEach(targetId => {
      const targetProp = computation.propsById[targetId];
      if (
        (targetProp.type === 'attribute' || targetProp.type === 'skill')
        && targetProp.variableName
        && !prop.targetField
      ) {
        // If the field wasn't specified and we're targeting an attribute or
        // skill, just treat it like a normal effect on its variable name
        dependencyGraph.addLink(targetProp.variableName, prop._id, 'effect');
      } else {
        // Otherwise target a field on that property
        const key = prop.targetField || getDefaultCalculationField(targetProp);
        const calcObj = get(targetProp, key);
        if (calcObj) {
          dependencyGraph.addLink(`${targetProp._id}.${key}`, prop._id, 'effect');
        }
      }
    });
  } else {
    prop.stats.forEach(statName => {
      if (!statName) return;
      dependencyGraph.addLink(statName, prop._id, 'effect');
    });
  }
}

// Returns an array of IDs of the properties the effect targets
export function getEffectTagTargets(effect, computation) {
  let targets = getTargetListFromTags(effect.targetTags, computation);
  let notIds = [effect._id]; // Can't target itself
  if (effect.extraTags) {
    effect.extraTags.forEach(ex => {
      if (ex.operation === 'OR') {
        targets = union(targets, getTargetListFromTags(ex.tags, computation));
      } else if (ex.operation === 'NOT') {
        ex.tags.forEach(tag => {
          const idList = computation.propsWithTag[tag];
          if (idList) {
            notIds = union(notIds, computation.propsWithTag[tag]);
          }
        });
      }
    });
  }
  return difference(targets, notIds);
}

function getTargetListFromTags(tags, computation) {
  const targetTagIdLists = [];
  if (!tags) return [];
  tags.forEach(tag => {
    const idList = computation.propsWithTag[tag] || [];
    targetTagIdLists.push(idList);
  });
  const targets = intersection(...targetTagIdLists);
  return targets;
}

function getDefaultCalculationField(prop) {
  switch (prop.type) {
    case 'action': return 'attackRoll';
    case 'adjustment': return 'amount';
    case 'attribute': return 'baseValue';
    case 'branch': return 'condition';
    case 'buff': return 'duration';
    case 'class': return null;
    case 'classLevel': return null;
    case 'constant': return null;
    case 'container': return null;
    case 'damageMultiplier': return null;
    case 'damage': return 'amount';
    case 'effect': return 'amount';
    case 'feature': return null;
    case 'folder': return null;
    case 'item': return null;
    case 'note': return null;
    case 'proficiency': return null;
    case 'reference': return null;
    case 'roll': return 'roll';
    case 'savingThrow': return 'dc';
    case 'skill': return 'baseValue';
    case 'slot': return 'quantityExpected';
    case 'spellList': return 'attackRollBonus';
    case 'spell': return null;
    case 'toggle': return 'condition';
  }
}

function linkRoll(dependencyGraph, prop) {
  dependOnCalc({ dependencyGraph, prop, key: 'roll' });
}

function linkVariableName(dependencyGraph, prop) {
  // The variableName of the prop depends on the prop if the prop is active
  if (prop.variableName && !prop.inactive) {
    dependencyGraph.addLink(prop.variableName, prop._id, 'definition');
  }
}

function linkDamageMultiplier(dependencyGraph, prop) {
  if (prop.inactive) return;
  prop.damageTypes.forEach(damageType => {
    // Remove all non-letter characters from the damage name
    const damageName = damageType.replace(/[^a-z]/gi, '')
    dependencyGraph.addLink(damageName, prop._id, prop.type);
  });
}

function linkPointBuy(dependencyGraph, prop) {
  dependOnCalc({ dependencyGraph, prop, key: 'min' });
  dependOnCalc({ dependencyGraph, prop, key: 'max' });
  dependOnCalc({ dependencyGraph, prop, key: 'total' });

  prop.values?.forEach((row, index) => {
    // Get a unique id for the row because it might be shared among duplicated point buy tables
    // prop._id is forced unique by the database, so it can be used instead
    const uniqueRowId = prop._id + '_row_' + index;
    // Wrap the document in a new object so we don't bash it unintentionally
    const pointBuyRow = {
      ...row,
      _id: uniqueRowId,
      type: 'pointBuyRow',
      tableName: prop.name,
      tableId: prop._id,
      rowIndex: index,
    }
    dependencyGraph.addNode(pointBuyRow._id, pointBuyRow);
    linkVariableName(dependencyGraph, pointBuyRow);
    dependencyGraph.addLink(pointBuyRow._id, prop._id, 'pointBuyRow');
  });
}

function linkProficiencies(dependencyGraph, prop, computation) {
  // The stats depend on the proficiency
  if (prop.inactive) return;
  if (prop.targetByTags) {
    // Tag targeted proficiencies depend on the creature's proficiencyBonus,
    // since they add it directly to the targeted field
    dependencyGraph.addLink(prop._id, 'proficiencyBonus', 'skillProficiencyBonus');
    getEffectTagTargets(prop, computation).forEach(targetId => {
      const targetProp = computation.propsById[targetId];
      if (
        (targetProp.type === 'attribute' || targetProp.type === 'skill')
        && targetProp.variableName
        && !prop.targetField
      ) {
        // If the field wasn't specified and we're targeting an attribute or
        // skill, just treat it like a normal proficiency on its variable name
        dependencyGraph.addLink(targetProp.variableName, prop._id, 'proficiency');
      } else {
        // Otherwise target a field on that property
        const key = prop.targetField || getDefaultCalculationField(targetProp);
        const calcObj = get(targetProp, key);
        if (calcObj) {
          dependencyGraph.addLink(`${targetProp._id}.${key}`, prop._id, 'proficiency');
        }
      }
    });
  } else {
    prop.stats.forEach(statName => {
      if (!statName) return;
      dependencyGraph.addLink(statName, prop._id, 'proficiency');
    });
  }
}

function linkSavingThrow(dependencyGraph, prop) {
  dependOnCalc({ dependencyGraph, prop, key: 'dc' });
}

function linkSkill(dependencyGraph, prop, computation) {
  // Depends on base value
  dependOnCalc({ dependencyGraph, prop, key: 'baseValue' });
  // Link dependents
  if (prop.inactive) return;
  linkVariableName(dependencyGraph, prop);
  // The prop depends on the variable references as the ability
  if (prop.ability) {
    dependencyGraph.addLink(prop._id, prop.ability, 'skillAbilityScore');
  }
  // Skills depend on the creature's proficiencyBonus
  dependencyGraph.addLink(prop._id, 'proficiencyBonus', 'skillProficiencyBonus');

  // Skills can apply their value as a proficiency bonus to calculations based on tag
  if (prop.targetByTags) {
    getEffectTagTargets(prop, computation).forEach(targetId => {
      const targetProp = computation.propsById[targetId];
      // Always target a field on the target property, applying a skill to an attribute or
      // other skill isn't supported
      const key = prop.targetField || getDefaultCalculationField(targetProp);
      const calcObj = get(targetProp, key);
      if (calcObj) {
        dependencyGraph.addLink(`${targetProp._id}.${key}`, prop._id, 'proficiency');
      }
    });
  }
}

function linkSlot(dependencyGraph, prop) {
  dependOnCalc({ dependencyGraph, prop, key: 'quantityExpected' });
  dependOnCalc({ dependencyGraph, prop, key: 'slotCondition' });
}

function linkSpellList(dependencyGraph, prop) {
  dependOnCalc({ dependencyGraph, prop, key: 'maxPrepared' });
  dependOnCalc({ dependencyGraph, prop, key: 'attackRollBonus' });
  dependOnCalc({ dependencyGraph, prop, key: 'dc' });
}

function linkToggle(dependencyGraph, prop) {
  linkVariableName(dependencyGraph, prop);
  dependOnCalc({ dependencyGraph, prop, key: 'condition' });
}
