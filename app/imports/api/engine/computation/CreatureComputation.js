import { EJSON } from 'meteor/ejson';
import createGraph from 'ngraph.graph';

export default class CreatureComputation {
  constructor(properties){
    // Set up fields
    this.originalPropsById =  {};
    this.propsById =  {};
    this.propsWithTag = {};
    this.scope = {};
    this.props =  properties;
    this.dependencyGraph = createGraph();

    // Store properties for easy access later
    properties.forEach(prop => {
      // Store a copy of the unmodified prop
      // EJSON clone is ~4x faster than lodash cloneDeep for EJSONable objects
      this.originalPropsById[prop._id] = EJSON.clone(prop);
      // Store by id
      this.propsById[prop._id] = prop;

      // Store sets of ids in each tag
      if (prop.tags){
        prop.tags.forEach(tag => {
          if (this.propsWithTag[tag]){
            this.propsWithTag[tag].push(prop._id);
          } else {
            this.propsWithTag[tag] = [prop._id];
          }
        });
      }

      // Store the prop in the dependency graph
      this.dependencyGraph.addNode(prop._id, prop);
    });
  }
}
