import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import CreatureProperties,
  { DenormalisedOnlyCreaturePropertySchema as denormSchema }
  from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { loadedCreatures } from '../loadCreatures.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
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

export default function buildCreatureComputation(creatureId){
  const creature = getCreature(creatureId);
  const properties = getProperties(creatureId);
  const computation = buildComputationFromProps(properties, creature);
  return computation;
}

function getProperties(creatureId) {
  if (loadedCreatures.has(creatureId)) {
    const creature = loadedCreatures.get(creatureId);
    const props = Array.from(creature.properties.values());
    return props;
  }
  console.time(`Cache miss fetching from db: ${creatureId}`)
  const props = CreatureProperties.find({
    'ancestors.id': creatureId,
    'removed': {$ne: true},
  }, {
    sort: { order: 1 },
    fields: { icon: 0 },
  }).fetch();
  console.timeEnd(`Cache miss fetching from db: ${creatureId}`);
  return props;
}

function getCreature(creatureId){
  return Creatures.findOne(creatureId, {
    denormalizedStats: 1,
  });
}

export function buildComputationFromProps(properties, creature){

  const computation = new CreatureComputation(properties, creature);
  // Dependency graph where edge(a, b) means a depends on b
  // The graph includes all dependencies even of inactive properties
  // such that any properties changing without changing their dependencies
  // can limit the recompute to connected parts of the graph
  // Each node's data represents a prop or a virtual prop like a variable
  // Each link's data is a string representing the link type
  const dependencyGraph = computation.dependencyGraph;

  // Link the denormalizedStats from the creature
  if (creature && creature.denormalizedStats){
    if (creature.denormalizedStats.xp){
      dependencyGraph.addNode('xp', {
        baseValue: creature.denormalizedStats.xp,
        type: '_variable'
      });
    }
    if (creature.denormalizedStats.milestoneLevels){
      dependencyGraph.addNode('milestoneLevels', {
        baseValue: creature.denormalizedStats.milestoneLevels,
        type: '_variable'
      });
    }
  }

  // Process the properties one by one
  properties.forEach(prop => {

    const computedSchema = computedOnlySchemas[prop.type];
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
