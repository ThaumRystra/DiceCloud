export default function computeSpelllist(computation, node) {
  const prop = node.data;

  const ability = computation.scope[prop.ability];
  prop.abilityMod = ability?.modifier || 0;
}