import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import CreatureProperties,
  { DenormalisedOnlyCreaturePropertySchema as denormSchema }
  from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import computedOnlySchemas from '/imports/api/properties/computedOnlyPropertySchemasIndex.js';
import computedSchemas from '/imports/api/properties/computedPropertySchemasIndex.js';
import applyFnToKey from '/imports/api/creature/computation/newEngine/utility/applyFnToKey.js';
import { cloneDeep, unset } from 'lodash';
import createGraph from 'ngraph.graph';
import computeInventory from '/imports/api/creature/computation/newEngine/buildComputation/computeInventory.js';
import walkDown from '/imports/api/creature/computation/newEngine/utility/walkdown.js';
import parseCalculationFields from '/imports/api/creature/computation/newEngine/buildComputation/parseCalculationFields.js';
import computeInactiveStatus from '/imports/api/creature/computation/newEngine/buildComputation/computeInactiveStatus.js';
import computeToggleDependencies from '/imports/api/creature/computation/newEngine/buildComputation/computeToggleDependencies.js';
import linkCalculationDependencies from '/imports/api/creature/computation/newEngine/buildComputation/linkCalculationDependencies.js';
import linkTypeDependencies from '/imports/api/creature/computation/newEngine/buildComputation/linkTypeDependencies.js';
import computeSlotQuantityFilled from '/imports/api/creature/computation/newEngine/buildComputation/computeSlotQuantityFilled.js';

/**
 * Store index of properties
 * recompute static tree-based enabled/disabled status
 * Build a dependency graph
 * id -> id dependencies for docs that rely on other docs directly
 * id -> variable deps for docs that rely on a variable's value
 * variable -> id deps for variables that are impacted by docs
 */

/**
 * Forseen issues: Anything that computes during the build step will not obey
 * computed toggles
 */

/**
 * TODO
 * compute class levels
 */

export default function buildCreatureComputation(creatureId){
  let properties = CreatureProperties.find({
    'ancestors.id': creatureId,
    'removed': {$ne: true},
  }, {
    sort: {order: 1}
  });

  // Dependency graph where edge(a, b) means a depends on b
  // The graph includes all dependencies even of inactive properties
  // such that any properties changing without changing their dependencies
  // can limit the recompute to connected parts of the graph
  // Each node's data represents a prop or a virtual prop like a variable
  // Each link's data: {type: String, data: Object, requiresComputation: Boolean}
  const dependencyGraph = createGraph();

  const computation = {
    originalPropsById: {},
    propsById: {},
    propsByType: {},
    propsByVariableName: {},
    props: properties,
    dependencyGraph,
  };

  // Process the properties one by one
  properties.forEach(prop => {

    // Store the prop in the memo by type, variableName and id
    storePropInMemo(prop, computation)

    // Store the prop in the dependency graph
    dependencyGraph.addNode(prop._id, prop);

    // Remove old computed only fields
    computedOnlySchemas[prop.type]._schemaKeys.forEach(key =>
      applyFnToKey(prop, key, unset)
    );

    // Remove old denormalised fields
    denormSchema._schemaKeys.forEach(key =>
      applyFnToKey(prop, key, unset)
    );

    // Add a place to store all the computation details
    prop._computationDetails = {
      calculations: [],
      toggleAncestors: [],
    };

    // Parse all the calculations
    parseCalculationFields(prop, computedSchemas)
  });

  // Get all the properties as trees based on their ancestors
  let forest = nodeArrayToTree(properties);
  // Walk the property trees computing things that need to be inherited
  walkDown(forest, node => {
    computeInactiveStatus(node);
    computeToggleDependencies(node);
    computeSlotQuantityFilled(node);
  });

  // Compute the inventory
  computeInventory(forest, dependencyGraph);

  // Graph functions that rely on the props being stored first
  properties.forEach(prop => {
    linkTypeDependencies(dependencyGraph, prop, computation);
    linkCalculationDependencies(dependencyGraph, prop, computation);
  });

  return computation;
}

function storePropInMemo(prop, memo){
  // Store dicts for easy access later
  // Store a copy of the unmodified prop
  memo.originalPropsById[prop._id] = cloneDeep(prop);
  // Store by id
  memo.propsById[prop._id] = prop;
  // Store by type
  memo.propsByType[prop.type] ?
    memo.propsByType[prop.type].push(prop) :
    memo.propsByType[prop.type] = [prop];
  // Store by variableName
  memo.propsByVariableName[prop.variableName] ?
    memo.propsByVariableName[prop.variableName].push(prop) :
    memo.propsByVariableName[prop.variableName]= [prop];
}
