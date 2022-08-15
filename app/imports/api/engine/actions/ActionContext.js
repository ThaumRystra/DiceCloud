import { CreatureLogSchema, insertCreatureLogWork } from '/imports/api/creature/log/CreatureLogs.js';
import {
  getCreature, getVariables, getPropertiesOfType
} from '/imports/api/engine/loadCreatures.js';
import { groupBy, remove } from 'lodash';

export default class ActionContext{
  constructor(creatureId, targetIds = [], method) {
    // Get the creature
    this.creature = getCreature(creatureId)

    if (!this.creature) {
      throw new Meteor.Error('No Creature', `No creature could be found with id: ${creatureId}`)
    }
    // Create a log
    this.log = CreatureLogSchema.clean({
      creatureId: creatureId,
      creatureName: this.creature.name,
    });

    // Get the variables of the acting creature
    this.creature.variables = getVariables(creatureId);
    delete this.creature.variables._id;
    delete this.creature.variables._creatureId;
    // Alias as scope
    this.scope = this.creature.variables;

    // Get the targets and their variables
    this.targets = [];
    targetIds.forEach(targetId => {
      let target;
      if (targetId === creatureId) {
        target = this.creature;
      } else {
        target = getCreature(targetId);
        target.variables = getVariables(targetId);
        delete target.variables._id;
        delete target.variables._creatureId;
      }
      this.targets.push(target);
    });

    // Store a reference to the method for inserting the log
    this.method = method;

    // Get triggers
    this.triggers = getPropertiesOfType(creatureId, 'trigger');
    // Remove deleted or inactive triggers
    remove(this.triggers, trigger => trigger.removed || trigger.inactive);
    // Sort triggers by order
    this.triggers.sort((a, b) => a.order - b.order);
    // Group the triggers into triggers.<event>.<timing> or
    // triggers.doActionProperty.<propertyType>.<timing>
    this.triggers = groupBy(this.triggers, 'event');
    for (let event in this.triggers) {
      if (event === 'doActionProperty') {
        this.triggers[event] = groupBy(this.triggers[event], 'actionPropertyType');
        for (let propertyType in this.triggers[event]) {
          this.triggers[event][propertyType] = groupBy(this.triggers[event][propertyType], 'timing');
        }
      } else {
        this.triggers[event] = groupBy(this.triggers[event], 'timing');
      }
    }
  }
  addLog(content) {
    if (content.name || content.value){
      this.log.content.push(content);
    }
  }
  writeLog() {
    insertCreatureLogWork({
      log: this.log,
      creature: this.creature,
      method: this.method,
    });
  }
}