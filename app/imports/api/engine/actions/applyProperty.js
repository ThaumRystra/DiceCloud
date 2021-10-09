
const applyPropertyByType = {
  action,
  branch,
  buff,
  damage,
  roll,
  savingThrow,
  spell,
  toggle,
};

export default function applyProperty(node, ...args){
  return applyPropertyByType[node.node.type]?.(node, ...args);
}
