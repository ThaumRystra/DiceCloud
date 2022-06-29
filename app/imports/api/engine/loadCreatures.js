import { debounce } from 'lodash';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import computeCreature from './computeCreature';

const COMPUTE_DEBOUNCE_TIME = 100; // ms
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

      const compute = debounce(Meteor.bindEnvironment(() => {
        computeCreature(creatureId);
      }), COMPUTE_DEBOUNCE_TIME);

      self.properties = new Map();
      // Observe all creature properties which are needed for computation
      self.propertyObserver = CreatureProperties.find({
        'ancestors.id': creatureId,
        removed: { $ne: true },
      }, {
        sort: { order: 1 },
        fields: { icon: 0 },
      }).observeChanges({
        added(id, fields) {
          fields._id = id;
          self.addProperty(fields);
          if (fields.dirty) compute();
        },
        changed(id, fields) {
          self.changeProperty(id, fields);
          if (fields.dirty) compute();
        },
        removed(id) {
          self.removeProperty(id);
          compute();
        },
      });
      
      // Observe the creature itself
      self.creatureObserver = Creatures.find({
        _id: creatureId,
      }).observeChanges({
        added(id, fields) {
          fields._id = id;
          self.addCreature(fields)
          if (fields.dirty) compute();
        },
        changed(id, fields) {
          self.changeCreature(id, fields);
          if (fields.dirty) compute();
        },
        removed(id) {
          self.removeCreature(id);
        },
      });

      // Observe the creature's variables
      self.variablesObserver = CreatureVariables.find({
        _creatureId: creatureId,
      }, {
        fields: { _creatureId: 0},
      }).observeChanges({
        added(id, fields) {
          fields._id = id;
          self.addVariables(fields)
        },
        changed(id, fields) {
          self.changeVariables(id, fields);
        },
        removed(id) {
          self.removeVariables(id);
        },
      });
    });
  }
  stop() {
    this.propertyObserver.stop();
    this.creatureObserver.stop();
    this.variablesObserver.stop();
  }
  addProperty(prop) {
    this.properties.set(prop._id, prop);
  }
  changeProperty(id, fields) {
    LoadedCreature.changeMap(id, fields, this.properties);
  }
  removeProperty(id) {
    this.properties.delete(id)
  }
  addCreature(creature) {
    this.creature = creature;
  }
  changeCreature(id, fields) {
    LoadedCreature.changeDoc(this.creature, fields);
  }
  removeCreature() {
    delete this.creature;
  }
  addVariables(variables) {
    this.variables = variables;
  }
  changeVariables(id, fields) {
    LoadedCreature.changeDoc(this.variables, fields);
  }
  removeVariables() {
    delete this.variables;
  }
  static changeMap(id, fields, map) {
    const doc = map.get(id);
    LoadedCreature.changeDoc(doc, fields);
  }
  static changeDoc(doc, fields) {
    if (!doc) return;
    for (let key in fields) {
      if (key === undefined) {
        delete doc[key];
      } else {
        doc[key] = fields[key];
      }
    }
  }
}
