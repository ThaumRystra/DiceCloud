import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';

export const loadedCreatures = new Map(); // creatureId => {creature, properties, etc.}

export function loadCreature(creatureId, subscription) {
  if (!creatureId) throw 'creatureId is required';
  let creature = loadedCreatures.get(creatureId);
  if (loadedCreatures.has(creatureId)) {
    creature.subs.add(subscription);
  } else {
    creature = new LoadedCreature(subscription, creatureId);
    loadedCreatures.set(creatureId, creature);
  }
  subscription.onStop(() => {
    unloadCreature(creatureId, subscription);
  });
}

function unloadCreature(creatureId, subscription) {
  if (!creatureId) throw 'creatureId is required';
  const creature = loadedCreatures.get(creatureId);
  if (!creature) return;
  creature.subs.delete(subscription);
  if (creature.subs.size === 0) {
    creature.stop();
    loadedCreatures.delete(creatureId);
  }
}

class LoadedCreature {
  constructor(sub, creatureId) {
    // This may be called from a subscription, but we don't want the observers
    // to be destroyed with it, so use a non-reactive context to observe
    // the required documents
    const self = this;
    Tracker.nonreactive(() => {

      self.subs = new Set([sub]);

      self.properties = new Map();
      // Observe all creature properties which are needed for computation
      self.propertyObserver = CreatureProperties.find({
        'ancestors.id': creatureId,
        removed: { $ne: true },
      }, {
        // sort: { order: 1 },
        fields: { icon: 0 },
      }).observeChanges({
        added(id, fields) {
          fields._id = id;
          return self.addProperty(fields)
        },
        changed(id, fields) {
          return self.changeProperty(id, fields);
        },
        removed(id) {
          return self.removeProperty(id);
        },
      });
      
      self.creatures = new Map();
      // Observe the creature itself
      self.creatureObserver = Creatures.find({
        _id: creatureId,
      }).observeChanges({
        added(id, fields) {
          fields._id = id;
          self.addCreature(fields)
        },
        changed(id, fields) {
          return self.changeCreature(id, fields);
        },
        removed(id) {
          return self.removeCreature(id);
        },
      });

    });
  }
  stop() {
    this.creatureObserver.stop();
    this.propertyObserver.stop();
  }
  addProperty(prop) {
    this.properties.set(prop._id, prop);
  }
  addCreature(creature) {
    this.creatures.set(creature._id, creature);
  }
  changeProperty(id, fields) {
    this.changeMap(id, fields, this.properties);
  }
  changeCreature(id, fields) {
    this.changeMap(id, fields, this.creatures);
  }
  changeMap(id, fields, map) {
    const doc = map.get(id);
    for (let key in fields) {
      if (key === undefined) {
        delete doc[key];
      } else {
        doc[key] = fields[key];
      }
    }
  }
  removeProperty(id) {
    this.properties.delete(id)
  }
  removeCreature(id) {
    this.creatures.delete(id)
  }
}
