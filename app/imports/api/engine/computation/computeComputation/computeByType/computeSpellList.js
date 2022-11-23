export default function computeSpelllist(computation, node) {
  const prop = node.data;

  const ability = computation.scope[prop.ability];
  if (Number.isFinite(ability?.modifier)) {
    prop.abilityMod = ability.modifier;
  } else if (Number.isFinite(ability?.value)) {
    prop.abilityMod = ability.value;
  }
}
