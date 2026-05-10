import { debounce } from 'lodash';
import type { Creature } from '/imports/api/creature/creatures/Creatures';
import type { CreatureProperty, CreaturePropertyTypes } from '/imports/api/creature/creatureProperties/CreatureProperties';
import computeCreature from './computeCreature';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import type { PropertyType } from '/imports/api/properties/PropertyType.type';
import type { Variables } from '/imports/api/engine/computation/CreatureComputation';

const Creatures = Mongo.getCollection('creatures') as Mongo.Collection<Creature>;
const CreatureProperties = Mongo.getCollection('creatureProperties') as Mongo.Collection<CreatureProperty>

const COMPUTE_DEBOUNCE_TIME = 100; // ms
export const loadedCreatures: Map<string, LoadedCreature> = new Map();

function logLoadedCreatures() {
  let creatureLoadString = '';
  for (const [key, value] of loadedCreatures.entries()) {
    creatureLoadString += `${key}: ${value.subs.size}\n`;
  }
  console.log(creatureLoadString);
}

export async function loadCreature(creatureId: string, subscription: Subscription) {
  if (!creatureId) throw new Meteor.Error('invalid-argument', 'creatureId is required');
  let creature = loadedCreatures.get(creatureId);
  if (!creature?.subs.has(subscription)) {
    subscription.onStop(() => {
      unloadCreature(creatureId, subscription);
    });
  }
  if (creature) {
    creature.subs.add(subscription);
  } else {
    creature = await LoadedCreature.create(subscription, creatureId);
    loadedCreatures.set(creatureId, creature);
  }
  logLoadedCreatures()
}

export function unloadAllCreatures() {
  for (const [id, creature] of loadedCreatures) {
    creature.stop();
    loadedCreatures.delete(id);
  }
}

function unloadCreature(creatureId: string, subscription: Subscription) {
  if (!creatureId) throw new Meteor.Error('invalid-argument', 'creatureId is required');
  const creature = loadedCreatures.get(creatureId);
  if (!creature) return;
  creature.subs.delete(subscription);
  if (creature.subs.size === 0) {
    loadedCreatures.delete(creatureId);
    creature.stop();
  }
  logLoadedCreatures()
}

export async function getSingleProperty(creatureId: string, propertyId: string) {
  const creature = loadedCreatures.get(creatureId)
  const property = creature?.properties.get(propertyId);
  if (property?.removed) return;
  if (property) {
    return EJSON.clone(property);
  }
  console.time(`Cache miss on creature properties: ${creatureId}`)
  const prop = await CreatureProperties.findOneAsync({
    _id: propertyId,
    'root.id': creatureId,
    'removed': { $ne: true },
  });
  console.timeEnd(`Cache miss on creature properties: ${creatureId}`);
  return prop;
}

export async function getProperties(creatureId: string): Promise<CreatureProperty[]> {
  const creature = loadedCreatures.get(creatureId);
  if (creature) {
    const props = Array.from(creature.properties.values())
      .sort((a, b) => a.left - b.left)
      .filter(prop => !prop.removed);
    return EJSON.clone(props);
  }
  console.time(`Cache miss on creature properties: ${creatureId}`)
  const props = await CreatureProperties.find({
    'root.id': creatureId,
    'removed': { $ne: true },
  }, {
    sort: { left: 1 },
  }).fetchAsync();
  console.timeEnd(`Cache miss on creature properties: ${creatureId}`);
  return props;
}

export async function getPropertiesOfType<T extends PropertyType>(creatureId: string, propType: T): Promise<CreaturePropertyTypes[T][]> {
  const creature = loadedCreatures.get(creatureId);
  if (creature) {
    const props = Array.from(creature.properties.values())
      .filter((prop): prop is CreaturePropertyTypes[T] => !prop.removed && prop.type === propType)
      .sort((a, b) => a.left - b.left);
    return EJSON.clone(props);
  }
  console.time(`Cache miss on creature properties: ${creatureId}`)
  const props: CreaturePropertyTypes[T][] = await CreatureProperties.find({
    'root.id': creatureId,
    'removed': { $ne: true },
    'type': propType as never,
  }, {
    sort: { left: 1 },
  }).fetchAsync() as CreaturePropertyTypes[T][];
  console.timeEnd(`Cache miss on creature properties: ${creatureId}`);
  return props;
}

/**
 * Get the properties of a creature that matches the filters given
 * @param creatureId The id of the creature
 * @param filterFn A function that returns true if the given prop matches the filter
 * @param mongoFilter A mongo selector that is exactly equal to the above function
 */
export function getPropertiesByFilter(
  creatureId: string,
  filterFn: (value: CreatureProperty, index: number, array: CreatureProperty[]) => unknown,
  mongoFilter: Mongo.Selector<CreatureProperty>
) {
  const creature = loadedCreatures.get(creatureId);
  if (creature) {
    const props: CreatureProperty[] = Array.from(creature.properties.values())
      .filter(filterFn)
      .sort((a, b) => a.left - b.left);
    return EJSON.clone(props);
  }
  console.time(`Cache miss on creature properties: ${creatureId}`)
  const props = CreatureProperties.find({
    'root.id': creatureId,
    'removed': { $ne: true },
    ...mongoFilter
  }, {
    sort: { left: 1 },
  }).fetch();
  console.timeEnd(`Cache miss on creature properties: ${creatureId}`);
  return props;
}

export async function getCreature(creatureId: string) {
  const loadedCreature = loadedCreatures.get(creatureId);
  const loadedCreatureDoc = loadedCreature?.creature;
  if (loadedCreatureDoc) {
    return EJSON.clone(loadedCreatureDoc);
  }
  console.time(`Cache miss on Creature: ${creatureId}`);
  const creature = await Creatures.findOneAsync(creatureId);
  console.timeEnd(`Cache miss on Creature: ${creatureId}`);
  return creature;
}

export function getVariables(creatureId: string): Variables {
  const loadedCreature = loadedCreatures.get(creatureId);
  const loadedVariables = loadedCreature?.variables;
  if (loadedVariables) {
    return EJSON.clone(loadedVariables);
  } else {
    return {} as Variables;
  };
}

export async function getPropertyAncestors(creatureId: string, propertyId: string) {
  const prop = await getSingleProperty(creatureId, propertyId);
  if (!prop) return [];
  const loadedCreature = loadedCreatures.get(creatureId);
  if (loadedCreature) {
    // Get the ancestor properties from the cache
    const props: CreatureProperty[] = [];
    let currentProp: CreatureProperty | undefined = prop;
    // Iterate through parent chain to get all linked ancestors
    while (currentProp?.parentId) {
      currentProp = await getSingleProperty(creatureId, currentProp.parentId);
      if (currentProp) props.push(currentProp);
    }
    return EJSON.clone(props);
  } else {
    // Fetch from database
    return CreatureProperties.find({
      ...getFilter.ancestors(prop),
      removed: { $ne: true },
    }, {
      sort: { left: 1 }
    }).fetch();
  }
}

export async function getPropertyDescendants(creatureId: string, propertyId: string) {
  const property = await getSingleProperty(creatureId, propertyId);
  if (!property) return [];
  if (loadedCreatures.has(creatureId)) {
    const creature = loadedCreatures.get(creatureId);
    if (!creature) return [];
    const props: CreatureProperty[] = [];
    // Loop through all properties and find ones that match the nested set condition
    for (const prop of creature.properties.values()) {
      if (
        prop.left > property.left
        && prop.right < property.right
        && prop.removed !== true
      ) {
        props.push(prop);
      }
    }
    const cloneProps = EJSON.clone(props).sort((a, b) => a.left - b.left);
    return cloneProps;
  } else {
    return CreatureProperties.find({
      ...getFilter.descendants(property),
      removed: { $ne: true },
    }, {
      sort: { left: 1 },
    }).fetch();
  }
}

/**
 * @param {string} creatureId Creature ID
 * @param {string | any} property prop or prop ID to get children of
 * @returns {any[]} An array of child properties in tree order
 */
export async function getPropertyChildren(creatureId: string, property: string | CreatureProperty | undefined) {
  if (typeof property === 'string') {
    property = await getSingleProperty(creatureId, property);
  }
  if (!property) return [];
  // This propertyId will always appear in the parent of the children
  if (loadedCreatures.has(creatureId)) {
    const creature = loadedCreatures.get(creatureId);
    if (!creature) return [];
    const props: CreatureProperty[] = [];
    for (const prop of creature.properties.values()) {
      if (prop.parentId === property._id && prop.removed !== true) {
        props.push(prop);
      }
    }
    const cloneProps = EJSON.clone(props);
    return cloneProps.sort((a, b) => a.left - b.left);
  } else {
    return CreatureProperties.find({
      'parentId': property._id,
      removed: { $ne: true },
    }, {
      sort: { left: 1 },
    }).fetch();
  }
}

class LoadedCreature {
  subs: Set<Subscription>;
  propertyObserver!: Meteor.LiveQueryHandle;
  creatureObserver!: Meteor.LiveQueryHandle;
  variablesObserver!: Meteor.LiveQueryHandle;
  properties: Map<string, CreatureProperty>;
  creature?: Creature;
  variables: Variables;

  private constructor(sub: Subscription) {
    this.subs = new Set([sub]);
    this.properties = new Map();
    this.variables = {};
  }

  static async create(sub: Subscription, creatureId: string): Promise<LoadedCreature> {
    const loaded = new LoadedCreature(sub);
    // This may be called from a subscription, but we don't want the observers
    // to be destroyed with it, so use a non-reactive context to observe
    // the required documents
    await Tracker.nonreactive(async () => {
      const compute = debounce(async () => {
        // It's possible that the creature was unloaded before we get around to computing it
        if (!loadedCreatures.has(creatureId)) return;
        console.log('Computing: ', creatureId)
        try {
          await computeCreature(creatureId);
        } catch (e) {
          console.error(e);
          throw e;
        }
      }, COMPUTE_DEBOUNCE_TIME);

      // Observe all creature properties which are needed for computation
      loaded.propertyObserver = await CreatureProperties.find({
        'root.id': creatureId,
      }).observeChangesAsync({
        added(id, fields: CreatureProperty) {
          fields._id = id;
          loaded.addProperty(fields);
          if (fields.dirty) void compute();
        },
        changed(id, fields) {
          loaded.changeProperty(id, fields);
          if (fields.dirty) void compute();
        },
        removed(id) {
          loaded.removeProperty(id);
          void compute();
        },
      });

      // Observe the creature itself
      loaded.creatureObserver = await Creatures.find({
        _id: creatureId,
      }).observeChangesAsync({
        added(id, fields: Creature) {
          fields._id = id;
          loaded.addCreature(fields)
          if (fields.dirty) void compute();
        },
        changed(id, fields) {
          loaded.changeCreature(id, fields);
          if (fields.dirty) void compute();
        },
        removed() {
          loaded.removeCreature();
        },
      });
    });
    return loaded;
  }
  stop() {
    this.propertyObserver.stop();
    this.creatureObserver.stop();
    this.variablesObserver.stop();
  }
  addProperty(prop: CreatureProperty) {
    this.properties.set(prop._id, prop);
  }
  changeProperty(id: string, fields: Partial<CreatureProperty>) {
    LoadedCreature.changeMap(id, fields, this.properties);
  }
  removeProperty(id: string) {
    this.properties.delete(id)
  }
  addCreature(creature: Creature) {
    this.creature = creature;
  }
  changeCreature(id: string, fields: Partial<Creature>) {
    if (this.creature) LoadedCreature.changeDoc(this.creature, fields);
  }
  removeCreature() {
    delete this.creature;
  }
  changeVariables(id: string, fields: Record<string, unknown>) {
    LoadedCreature.changeDoc(this.variables, fields);
  }
  removeVariables() {
    this.variables = {};
  }
  static changeMap(id: string, fields: Record<string, unknown>, map: Map<string, Record<string, unknown>>) {
    const doc = map.get(id);
    if (doc) LoadedCreature.changeDoc(doc, fields);
  }
  static changeDoc(doc: Record<string, unknown>, fields: Record<string, unknown>) {
    if (!doc) return;
    for (const key in fields) {
      if (key === undefined) {
        delete doc[key];
      } else {
        doc[key] = fields[key];
      }
    }
  }
}
