import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import CreatureProperties,
  { DenormalisedOnlyCreaturePropertySchema as denormSchema }
  from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { loadedCreatures } from '../loadCreatures.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables.js';
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
  const variables = getVariables(creatureId);
  const properties = getProperties(creatureId);
  const computation = buildComputationFromProps(properties, creature, variables);
  return computation;
}

function getProperties(creatureId) {
  if (loadedCreatures.has(creatureId)) {
    const creature = loadedCreatures.get(creatureId);
    const props = Array.from(creature.properties.values());
    const cloneProps = EJSON.clone(props);
    return cloneProps
  }
  // console.time(`Cache miss on creature properties: ${creatureId}`)
  const props = CreatureProperties.find({
    'ancestors.id': creatureId,
    'removed': {$ne: true},
  }, {
    sort: { order: 1 },
    fields: { icon: 0 },
  }).fetch();
  // console.timeEnd(`Cache miss on creature properties: ${creatureId}`);
  return props;
}

function getCreature(creatureId) {
  if (loadedCreatures.has(creatureId)) {
    const loadedCreature = loadedCreatures.get(creatureId);
    const creature = loadedCreature.creature;
    if (creature) return creature;
  }
  // console.time(`Cache miss on Creature: ${creatureId}`);
  const creature = Creatures.findOne(creatureId, {
    denormalizedStats: 1,
    variables: 1,
    dirty: 1,
  });
  // console.timeEnd(`Cache miss on Creature: ${creatureId}`);
  return creature;
}

function getVariables(creatureId) {
  if (loadedCreatures.has(creatureId)) {
    const loadedCreature = loadedCreatures.get(creatureId);
    const variables = loadedCreature.variables;
    if (variables) return variables;
  }
  // console.time(`Cache miss on variables: ${creatureId}`);
  const variables = CreatureVariables.findOne({_creatureId: creatureId});
  // console.timeEnd(`Cache miss on variables: ${creatureId}`);
  return variables;
}

export function buildComputationFromProps(properties, creature, variables){

  const computation = new CreatureComputation(properties, creature, variables);
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
    // The prop has been processed, it's no longer dirty
    delete prop.dirty;

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
