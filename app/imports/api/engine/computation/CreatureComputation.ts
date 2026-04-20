import { EJSON } from 'meteor/ejson';
import createGraph, { type Graph } from 'ngraph.graph';
import getEffectivePropTags from '/imports/api/engine/computation/utility/getEffectivePropTags';
import type { Creature } from '/imports/api/creature/creatures/Creatures';
import type { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';

export type ComputationProperty = CreatureProperty & {
  _computationDetails: {
    calculations: { todo: string }[],
    emptyCalculations: { todo: string }[],
    inlineCalculations: { todo: string }[],
    toggleAncestors: { todo: string }[],
  }
};

type DenormalizedVariable = {
  baseValue: number;
  type: '_variable';
}

export type Variables = Record<string, CreatureProperty | { _propId: string }> & { _creatureId?: string };

export type DependencyGraphNode = CreatureProperty | DenormalizedVariable

export default class CreatureComputation {
  originalPropsById: Record<string, CreatureProperty>;
  propsById: Record<string, CreatureProperty>;
  propsWithTag: Record<string, string[]>;
  scope: Record<string, CreatureProperty>;
  props: ComputationProperty[];
  dependencyGraph: Graph<DependencyGraphNode, string>;
  errors: Array<Meteor.Error>;
  creature: Creature;
  variables: Variables;

  constructor(properties: Array<CreatureProperty>, creature: Creature, variables: Variables) {
    // Set up fields
    this.originalPropsById = {};
    this.propsById = {};
    this.propsWithTag = {};
    this.scope = {};
    this.dependencyGraph = createGraph();
    this.errors = [];
    this.creature = creature;
    this.variables = variables;

    // Store properties and index for easy access later
    this.props = properties.map(originalProp => {
      const prop: ComputationProperty = Object.assign(EJSON.clone(originalProp), {
        _computationDetails: {
          calculations: [],
          emptyCalculations: [],
          inlineCalculations: [],
          toggleAncestors: [],
        }
      });
      // Store a copy of the unmodified prop
      // EJSON clone is ~4x faster than lodash cloneDeep for EJSONable objects
      this.originalPropsById[prop._id] = originalProp;
      // Store by id
      this.propsById[prop._id] = prop;

      // Store sets of ids in each tag
      getEffectivePropTags(prop).forEach(tag => {
        if (!tag) return;
        if (this.propsWithTag[tag]) {
          this.propsWithTag[tag].push(prop._id);
        } else {
          this.propsWithTag[tag] = [prop._id];
        }
      });

      // Store the prop in the dependency graph
      this.dependencyGraph.addNode(prop._id, prop);

      return prop;
    });
  }
}
