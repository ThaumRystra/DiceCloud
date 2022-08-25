// If we compute this skill  without a variable name, it just
// uses its base value, proficiency, and damage since no effects can target it
// If this skill does have a variable name, it is recomputed later
// by computeVariableAsSkill
export default function computeSkill(computation, node){
  const prop = node.data;
  prop.proficiency = prop.baseProficiency || 0;
  let profBonus = computation.scope['proficiencyBonus']?.value || 0;
  // Multiply the proficiency bonus by the actual proficiency
  if(prop.proficiency === 0.49){
    // Round down proficiency bonus in the special case
    profBonus = Math.floor(profBonus * 0.5);
  } else {
    profBonus = Math.ceil(profBonus * prop.proficiency);
  }

  const ability = computation.scope[prop.ability];
  prop.abilityMod = ability?.modifier || 0;

  const base = prop.baseValue?.value || 0;

  let result = base + prop.abilityMod + profBonus;
  if (Number.isFinite(result)){
    result = Math.floor(result);
  }

  prop.value = result;
}
