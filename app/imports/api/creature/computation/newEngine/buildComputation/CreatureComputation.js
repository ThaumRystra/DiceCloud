import { cloneDeep } from 'lodash';
import createGraph from 'ngraph.graph';

export default class CreatureComputation {
  constructor(properties){
    // Set up fields
    this.originalPropsById =  {};
    this.propsById =  {};
    this.propsByType =  {};
    this.propsByVariableName =  {};
    this.props =  properties;
    this.dependencyGraph = createGraph();

    // Store properties for easy access later
    properties.forEach(prop => {
      // Store a copy of the unmodified prop
      this.originalPropsById[prop._id] = cloneDeep(prop);

      // Store by id
      this.propsById[prop._id] = prop;

      // Store by type
      this.propsByType[prop.type] ?
        this.propsByType[prop.type].push(prop) :
        this.propsByType[prop.type] = [prop];

      // Store by variableName
      this.propsByVariableName[prop.variableName] ?
        this.propsByVariableName[prop.variableName].push(prop) :
        this.propsByVariableName[prop.variableName]= [prop];

      // Store the prop in the dependency graph
      this.dependencyGraph.addNode(prop._id, prop);
    });
  }
}
