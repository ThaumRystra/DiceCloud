import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import CreatureProperties,
  { DenormalisedOnlyCreaturePropertySchema as denormSchema }
  from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import computedOnlySchemas from '/imports/api/properties/computedOnlyPropertySchemasIndex.js';
import computedSchemas from '/imports/api/properties/computedPropertySchemasIndex.js';
import linkInventory from './buildComputation/linkInventory.js';
import walkDown from './utility/walkdown.js';
import parseCalculationFields from './buildComputation/parseCalculationFields.js';
import computeInactiveStatus from './buildComputation/computeInactiveStatus.js';
import computeToggleDependencies from './buildComputation/computeToggleDependencies.js';
import linkCalculationDependencies from './buildComputation/linkCalculationDependencies.js';
import linkTypeDependencies from './buildComputation/linkTypeDependencies.js';
import computeSlotQuantityFilled from './buildComputation/computeSlotQuantityFilled.js';
import CreatureComputation from './CreatureComputation.js';
import removeSchemaFields from './buildComputation/removeSchemaFields.js';

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
  const properties = getProperties(creatureId);
  return buildComputationFromProps(properties);
}

function getProperties(creatureId){
  return CreatureProperties.find({
    'ancestors.id': creatureId,
    'removed': {$ne: true},
  }, {
    sort: {order: 1}
  });
}

export function buildComputationFromProps(properties){

  const computation = new CreatureComputation(properties);
  // Dependency graph where edge(a, b) means a depends on b
  // The graph includes all dependencies even of inactive properties
  // such that any properties changing without changing their dependencies
  // can limit the recompute to connected parts of the graph
  // Each node's data represents a prop or a virtual prop like a variable
  // Each link's data is a string representing the link type
  const dependencyGraph = computation.dependencyGraph;

  // Process the properties one by one
  properties.forEach(prop => {

    let computedSchema = computedOnlySchemas[prop.type];
    removeSchemaFields([computedSchema, denormSchema], prop);

    // Add a place to store all the computation details
    prop._computationDetails = {
      calculations: [],
      inlineCalculations: [],
      toggleAncestors: [],
    };

    // Parse all the calculations
    parseCalculationFields(prop, computedSchemas);

  });

  // Get all the properties as trees based on their ancestors
  let forest = nodeArrayToTree(properties);
  // Walk the property trees computing things that need to be inherited
  walkDown(forest, node => {
    computeInactiveStatus(node);
    computeToggleDependencies(node, dependencyGraph);
    computeSlotQuantityFilled(node, dependencyGraph);
  });

  // Link the inventory dependencies
  linkInventory(forest, dependencyGraph);

  // Link functions that require the above to be complete
  properties.forEach(prop => {
    linkTypeDependencies(dependencyGraph, prop, computation);
    linkCalculationDependencies(dependencyGraph, prop, computation);
  });

  return computation;
}
