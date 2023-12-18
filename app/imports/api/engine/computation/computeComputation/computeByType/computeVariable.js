import aggregate from './computeVariable/aggregate/index';
import computeVariableAsAttribute from './computeVariable/computeVariableAsAttribute';
import computeVariableAsSkill from './computeVariable/computeVariableAsSkill';
import computeVariableAsConstant from './computeVariable/computeVariableAsConstant';
import computeVariableAsClass from './computeVariable/computeVariableAsClass';
import computeVariableAsToggle from './computeVariable/computeVariableAsToggle';
import computeImplicitVariable from './computeVariable/computeImplicitVariable';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';

export default function computeVariable(computation, node) {
  const scope = computation.scope;
  if (!node.data) node.data = {};
  aggregateLinks(computation, node);
  combineAggregations(computation, node);
  // Don't add to the scope if the node id is not a legitimate variable name
  // Without this `some.thing` could break the entire sheet as a database key
  if (!VARIABLE_NAME_REGEX.test(node.id)) return;
  if (node.data.definingProp) {
    // Add the defining variable to the scope
    scope[node.id] = node.data.definingProp
  } else {
    // Otherwise add an implicit variable to the scope
    scope[node.id] = computeImplicitVariable(node);
  }
}

function aggregateLinks(computation, node) {
  computation.dependencyGraph.forEachLinkedNode(
    node.id,
    (linkedNode, link) => {
      if (!linkedNode.data) linkedNode.data = {};
      // Ignore inactive props
      if (linkedNode.data.inactive) return;
      // Ignore point buy rows if their base table is inactive
      if (
        linkedNode.data.tableId
        && computation.propsById[linkedNode.data.tableId]?.inactive
      ) return;
      // Apply all the aggregations
      let arg = { node, linkedNode, link, computation };
      aggregate.classLevel(arg);
      aggregate.damageMultiplier(arg);
      aggregate.definition(arg);
      aggregate.effect(arg);
      aggregate.eventDefinition(arg);
      aggregate.inventory(arg);
      aggregate.proficiency(arg);
    },
    true // enumerate only outbound links
  );
}

function combineAggregations(computation, node) {
  combineMultiplierAggregator(node);
  node.data.overridenProps?.forEach(prop => {
    computeVariableProp(computation, node, prop);
  });
  computeVariableProp(computation, node, node.data.definingProp);
}

function computeVariableProp(computation, node, prop) {
  if (!prop) return;

  // Combine damage multipliers in all props so that they can't be overridden
  if (node.data.immunity) {
    prop.immunity = node.data.immunity;
    prop.immunities = node.data.immunities;
  }
  if (node.data.resistance) {
    prop.resistance = node.data.resistance;
    prop.resistances = node.data.resistances;
  }
  if (node.data.vulnerability) {
    prop.vulnerability = node.data.vulnerability;
    prop.vulnerabilities = node.data.vulnerabilities;
  }

  if (prop.type === 'attribute') {
    computeVariableAsAttribute(computation, node, prop);
  } else if (prop.type === 'skill') {
    computeVariableAsSkill(computation, node, prop);
  } else if (prop.type === 'constant') {
    computeVariableAsConstant(computation, node, prop);
  } else if (prop.type === 'class') {
    computeVariableAsClass(computation, node, prop);
  } else if (prop.type === 'toggle') {
    computeVariableAsToggle(computation, node, prop);
  }
}

function combineMultiplierAggregator(node) {
  // get a reference to the  aggregator
  const aggregator = node.data.multiplierAggregator;
  if (!aggregator) return;

  // Combine
  if (aggregator.immunities?.length) {
    node.data.immunity = true;
    node.data.immunities = aggregator.immunities;
  }
  if (aggregator.resistances?.length) {
    node.data.resistance = true;
    node.data.resistances = aggregator.resistances;
  }
  if (aggregator.vulnerabilities?.length) {
    node.data.vulnerability = true;
    node.data.vulnerabilities = aggregator.vulnerabilities;
  }
}
