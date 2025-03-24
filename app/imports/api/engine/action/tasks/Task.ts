import { CreatureProperty, CreaturePropertyTypes } from '/imports/api/creature/creatureProperties/CreatureProperties';
import { CheckParams } from '/imports/api/engine/action/functions/userInput/InputProvider';

type Task = PropTask | DamagePropTask | ItemAsAmmoTask | CheckTask | ResetTask | CastSpellTask;

export default Task;

type BaseTask = {
  targetIds: string[];
  silent?: boolean | undefined;
}

export type PropTask = BaseTask & {
  prop: CreatureProperty;
  subtaskFn?: undefined;
  silent?: undefined;
}

export type DamagePropTask = BaseTask & {
  subtaskFn: 'damageProp';
  params: {
    /**
     * Use getPropertyTitle(prop) to set the title
     */
    title?: string;
    operation: 'increment' | 'set';
    value: number;
    targetProp: CreatureProperty;
  };
}

export type ItemAsAmmoTask = BaseTask & {
  subtaskFn: 'consumeItemAsAmmo';
  prop: CreatureProperty;
  silent?: undefined;
  params: {
    value: number;
    item: any;
    skipChildren: boolean;
  };
}

export type CheckTask = BaseTask & CheckParams & {
  subtaskFn: 'check';
}

export type ResetTask = BaseTask & {
  subtaskFn: 'reset';
  eventName: string;
  // One and only one target
  targetIds: [string];
}

export type CastSpellTask = BaseTask & {
  prop: CreaturePropertyTypes['spell'];
  silent?: undefined;
  subtaskFn: 'castSpell';
  params: {
    slotId: string | undefined;
    ritual: boolean | undefined;
    withoutSpellSlot: boolean | undefined;
  };
}
