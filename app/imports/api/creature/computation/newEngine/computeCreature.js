import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import CreatureProperties,
  { DenormalisedOnlyCreaturePropertySchema as denormSchema }
  from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import computedOnlySchemas from '/imports/api/properties/computedOnlyPropertySchemasIndex.js';
import computedSchemas from '/imports/api/properties/computedPropertySchemasIndex.js';
import applyFnToKey from '/imports/api/creature/computation/newEngine/applyFnToKey.js';
import { cloneDeep, unset } from 'lodash';
import { prettifyParseError, parse } from '/imports/parser/parser.js';
import ErrorNode from '/imports/parser/parseTree/ErrorNode.js';
import SymbolNode from '/imports/parser/parseTree/SymbolNode.js';
import AccessorNode from '/imports/parser/parseTree/AccessorNode.js';
import createGraph from 'ngraph.graph';
import findAncestorByType from 'imports/api/creature/computation/newEngine/findAncestorByType.js';

/**
 * Store index of properties
 * recompute static tree-based enabled/disabled status
 * Build a dependency graph
 * id -> id dependencies for docs that rely on other docs directly
 * id -> variable deps for docs that rely on a variable's value
 * TODO:
 * variable -> id deps for variables that are impacted by docs
 * Depth first traversal or dependency graph to:
 *   Find loops in the dependency graph
 *   resolve variables in dependency order
 */

export default function computeCreature(creatureId){
  let properties = CreatureProperties.find({
    'ancestors.id': creatureId,
    'removed': {$ne: true},
  }, {
    sort: {order: 1}
  });

  const originalPropsById = {};
  const propsById = {};
  const propsByType = {};

  // Process the properties one by one
  properties.forEach(prop => {
    // Store the prop by Id and Type
    originalPropsById[prop._id] = cloneDeep(prop);
    propsById[prop._id] = prop;
    if (!propsByType[prop.type]) propsByType[prop.type] = [];
    propsByType[prop.type].push(prop);

    // Store the prop in the dependency graph
    dependencyGraph.addNode(prop._id, prop);

    // Remove all computed only fields
    computedOnlySchemas[prop.type]._schemaKeys.forEach(key =>
      applyFnToKey(prop, key, unset)
    );

    // Remove all denormalised fields
    denormSchema._schemaKeys.forEach(key =>
      applyFnToKey(prop, key, unset)
    );

    // Add a place to store all the computation details
    prop._computationDetails = {
      calculations: [],
      toggleAncestors: [],
    };

    // parse every calculation field
    computedSchemas[prop.type]._schemaKeys.forEach( key => {
      if (key.slice(-11) !== 'calculation') return;
      const calcKey = key.sclice(0, -11);
      applyFnToKey(prop, calcKey, calcObj => {
        // Store a reference to all the calculations
        prop._computationDetails.calculations.push(calcObj);
        // Parse the calculation
        parseCalculation(calcObj);
        return calcObj;
      });
    });
  });


  // Process the properties in tree format
  let creatureTree = nodeArrayToTree(properties);
  walkDown(creatureTree, node => {
    denormaliseInactiveStatus(node);
    inheritToggleDependencies(node);
    computeInventory(node);
  });

  // Dependency graph where edge(a, b) means a depends on b
  const dependencyGraph = createGraph();
  // Build graph now that all props are stored
  properties.forEach(prop => {
    linkTypeDependencies(dependencyGraph, prop, propsById);
    if (prop.inactive) return;
    linkCalculationDependencies(dependencyGraph, prop, propsById);
  });
}

function walkDown(tree, callback){
  let stack = [...tree];
  while(stack.length){
    let node = stack.pop();
    callback(node);
    stack.push(...node.children);
  }
}

function denormaliseInactiveStatus(node){
  const prop = node.node;
  if (isActive(prop)) return;
  prop.inactive = true;
  prop.deactivatedBySelf = true;
  // Mark children as inactive due to ancestor
  walkDown(node.children, child => {
    child.node.inactive = true;
    child.node.deactivatedByAncestor = true;
  });
}

function isActive(prop){
  if (prop.disabled) return false;
  switch (prop.type){
    case 'buff': return !!prop.applied;
    case 'item': return !!prop.equipped;
    case 'spell': return !!prop.prepared || !!prop.alwaysPrepared;
    default: return true;
  }
}

function inheritToggleDependencies(node, dependencyGraph){
  const prop = node.node;
  // Only for toggles that aren't inactive and aren't set to enabled or disabled
  if (
    prop.inactive ||
    prop.type !== 'toggle' ||
    prop.disabled ||
    prop.enabled
  ) return;
  walkDown(node.children, child => {
    child.node._computationDetails.toggleAncestors.push(prop._id);
    dependencyGraph.addLink(child.node._id, prop._id, prop.condition);
  });
}

function computeInventory(forest){
  const data = {
    weightTotal: 0,
    weightEquipment: 0,
    weightCarried: 0,
    valueTotal: 0,
    valueEquipment: 0,
    valueCarried: 0,
    itemsAttuned: 0,
  }
  // The stack of properties to still navigate
  const stack = [...forest];
  // The current containers we are inside of
  const containerStack = [];
  const visitedNodes = new Set();

  while(stack.length){
    const top = stack[stack.length - 1];
    // Leaf node
    if (top.children.length === 0){

    } else {

    }
  }
}

function parseCalculation(calcObj){
  let calculation = calcObj.calculation || '';
  try {
    calcObj._parsedCalculation = parse(calculation);
  } catch (e) {
    let error = prettifyParseError(e);
    calcObj.errors ?
      calcObj.errors.push(error) :
      calcObj.errors = [error];
    calcObj._parsedCalculation = new ErrorNode({error});
  }
}

function linkCalculationDependencies(dependencyGraph, prop, propsById){
  let variableNames = [];
  prop._computationDetails.calculations.forEach(calcObj => {
    calcObj._parsedCalculation.travese(node => {
      if (node instanceof SymbolNode || node instanceof AccessorNode){
        if (node.name[0] !== '#'){
          dependencyGraph.addLink(prop._id, node.name, calcObj);
        } else {
          let ancestorProp = findAncestorByType(
            prop, node.name.slice(1), propsById
          );
          if (!ancestorProp) return;
          dependencyGraph.addLink(prop._id, ancestorProp._id, calcObj);
        }
      }
    });
  });
  return variableNames;
}

const inventoryVariables = [
  'weightTotal',
  'weightEquipment',
  'weightCarried',
  'valueTotal',
  'valueEquipment',
  'valueCarried',
  'itemsAttuned',
];

const linkDependenciesByType = {
  attribute: linkVariableName,
  classLevel: linkVariableName,
  constant: linkVariableName,
  container: linkInventoryVariables,
}

function linkVariableName(dependencyGraph, prop){
  if (prop.inactive) return;
  if (prop.variableName){
    dependencyGraph.addLink(prop.variableName, prop._id);
  }
}

function linkInventoryVariables(dependencyGraph, prop){
  inventoryVariables.forEach(variableName => {
    dependencyGraph.addLink(variableName, prop._id);
  });
}

function linkTypeDependencies(dependencyGraph, prop){
  linkDependenciesByType[prop.type]?.(prop);
}
