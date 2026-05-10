import type { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import type { Variables } from '/imports/api/engine/computation/CreatureComputation';
import { getSingleProperty } from '/imports/api/engine/loadCreatures';
import type { PointBuyRow } from '/imports/api/properties/PointBuys';
import type { ParseNode } from '/imports/parser/parseTree/ParseNode';
import array from '/imports/parser/parseTree/array';
import constant, { isFiniteNode } from '/imports/parser/parseTree/constant';

/**
 * Get the property from the given scope, respecting properties that are just a link to the actual
 * property document
 */
export async function getFromScope(name: string, scope: Variables): Promise<CreatureProperty | PointBuyRow | { value: number | boolean } | undefined> {
  if (name === '_creatureId') return;
  const scopeValue = scope?.[name];
  if (scopeValue && '_propId' in scopeValue) {
    const [propId, rowIdentifier, rowNumber] = scopeValue._propId.split('_');
    const prop = await getSingleProperty(scope._creatureId, propId);
    if (rowIdentifier === 'row' && prop?.type === 'pointBuy') {
      return prop.values[+rowNumber];
    } else {
      return prop;
    }
  }
  return scopeValue;
}

export async function getNumberFromScope(name: string, scope: Variables) {
  const parseNode = await getParseNodeFromScope(name, scope);
  if (!parseNode || !isFiniteNode(parseNode)) {
    return undefined;
  }
  return parseNode.value;
}

export async function getConstantValueFromScope(name: string, scope: Variables) {
  const parseNode = await getParseNodeFromScope(name, scope);
  if (!parseNode) return;
  if (parseNode.parseType !== 'constant') return;
  return parseNode.value;
}

export async function getParseNodeFromScope(name: string, scope: Variables): Promise<ParseNode | undefined> {
  const value = await getFromScope(name, scope);
  if (!value) return;
  let valueType = getType(value);
  // Iterate into object.values
  while (valueType === 'object') {
    // Prefer the valueNode over the value
    if (value && 'valueNode' in value && value?.valueNode) {
      value = value.valueNode;
    } else {
      value = value.value;
    }
    valueType = getType(value);
  }
  // Return a discovered parse node
  if (valueType === 'parseNode') {
    return value;
  }
  // Return a parse node based on the constant type returned
  if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
    return constant.create({ value });
  }
  // Return a parser array
  if (valueType === 'array') {
    // If the first value is a parse node, assume all the values are
    if (getType(value[0]) === 'parseNode') {
      return array.create({
        values: value,
      });
    }
    // Create the array from js primitives instead
    return array.fromConstantArray(value);
  }
}

function getType(val: Awaited<ReturnType<typeof getFromScope>>) {
  if (!val) return typeof val;
  if (Array.isArray(val)) return 'array';
  if ((typeof val === 'object') && 'parseType' in val && val.parseType) return 'parseNode';
  return typeof val;
}
