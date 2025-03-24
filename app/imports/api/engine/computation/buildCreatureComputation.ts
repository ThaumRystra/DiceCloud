import { applyNestedSetProperties } from '/imports/api/parenting/parentingFunctions';
import { CreatureProperty, DenormalisedOnlyCreaturePropertySchema as denormSchema }
  from '/imports/api/creature/creatureProperties/CreatureProperties';
import { getProperties, getCreature, getVariables } from '/imports/api/engine/loadCreatures';
import computedOnlySchemas from '/imports/api/properties/computedOnlyPropertySchemasIndex';
import computedSchemas from '/imports/api/properties/computedPropertySchemasIndex';
import linkInventory from './buildComputation/linkInventory';
import walkDown from './utility/walkdown';
import parseCalculationFields from './buildComputation/parseCalculationFields';
import computeInactiveStatus from './buildComputation/computeInactiveStatus';
import computeToggleDependencies from './buildComputation/computeToggleDependencies';
import linkCalculationDependencies from './buildComputation/linkCalculationDependencies';
import linkTypeDependencies from './buildComputation/linkTypeDependencies';
import computeSlotQuantityFilled from './buildComputation/computeSlotQuantityFilled';
import CreatureComputation from './CreatureComputation';
import removeSchemaFields from './buildComputation/removeSchemaFields';
import type { Creature } from '/imports/api/creature/creatures/Creatures';

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

export default function buildCreatureComputation(creatureId: string) {
  const creature = getCreature(creatureId);
  if (!creature) {
    throw new Meteor.Error('not-found',
      'Build computation failed, the creature was not found.' +
      '\nid: ' + creatureId
    );
  }
  const variables = getVariables(creatureId);
  const properties = getProperties(creatureId);
  const computation = buildComputationFromProps(properties, creature, variables);
  return computation;
}

export function buildComputationFromProps(
  properties: CreatureProperty[], creature: Creature, variables: any
) {

  const computation = new CreatureComputation(properties, creature, variables);
  // Dependency graph where edge(a, b) means a depends on b
  // The graph includes all dependencies even of inactive properties
  // such that any properties changing without changing their dependencies
  // can limit the recompute to connected parts of the graph
  // Each node's data represents a prop or a virtual prop like a variable
  // Each link's data is a string representing the link type
  const dependencyGraph = computation.dependencyGraph;

  // Link the denormalizedStats from the creature
  if (creature && creature.denormalizedStats) {
    if (creature.denormalizedStats.xp) {
      dependencyGraph.addNode('xp', {
        baseValue: creature.denormalizedStats.xp,
        type: '_variable'
      });
    }
    if (creature.denormalizedStats.milestoneLevels) {
      dependencyGraph.addNode('milestoneLevels', {
        baseValue: creature.denormalizedStats.milestoneLevels,
        type: '_variable'
      });
    }
  }

  // Process the properties one by one
  computation.props.forEach(prop => {
    // The prop has been processed, it's no longer dirty
    delete prop.dirty;

    const computedSchema = computedOnlySchemas[prop.type];
    removeSchemaFields([computedSchema, denormSchema], prop);

    // Parse all the calculations
    parseCalculationFields(prop, computedSchemas);
  });

  // Get all the properties as a forest, with their nested set properties set
  const forest = applyNestedSetProperties(computation.props);

  // Walk the property trees computing things that need to be inherited
  walkDown(forest.trees, node => {
    computeInactiveStatus(node);
  });
  // Inactive status must be complete for the whole tree before toggle deps
  // are calculated
  walkDown(forest.trees, node => {
    computeToggleDependencies(node, computation, forest);
    computeSlotQuantityFilled(node, dependencyGraph);
  });

  // Link the inventory dependencies
  linkInventory(forest, dependencyGraph);

  // Link functions that require the above to be complete
  computation.props.forEach(prop => {
    linkTypeDependencies(dependencyGraph, prop, computation);
    linkCalculationDependencies(dependencyGraph, prop, computation);
  });

  return computation;
}
