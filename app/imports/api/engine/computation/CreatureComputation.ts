import { EJSON } from 'meteor/ejson';
import createGraph, { Graph } from 'ngraph.graph';
import getEffectivePropTags from '/imports/api/engine/computation/utility/getEffectivePropTags';

interface CreatureProperty {
  _id: string;
  type: string;
}

export default class CreatureComputation {
  originalPropsById: Record<string, CreatureProperty>;
  propsById: Record<string, CreatureProperty>;
  propsWithTag: Record<string, string[]>;
  scope: Record<string, any>;
  props: Array<CreatureProperty>;
  dependencyGraph: Graph<any, string>;
  errors: Array<object>;
  creature: object;
  variables: object;

  constructor(properties: Array<CreatureProperty>, creature: object, variables: object) {
    // Set up fields
    this.originalPropsById = {};
    this.propsById = {};
    this.propsWithTag = {};
    this.scope = {};
    this.props = properties;
    this.dependencyGraph = createGraph();
    this.errors = [];
    this.creature = creature;
    this.variables = variables;

    // Store properties for easy access later
    properties.forEach(prop => {
      // Store a copy of the unmodified prop
      // EJSON clone is ~4x faster than lodash cloneDeep for EJSONable objects
      this.originalPropsById[prop._id] = EJSON.clone(prop);
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
    });
  }
}
