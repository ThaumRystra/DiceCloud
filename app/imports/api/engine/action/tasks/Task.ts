import type { CreatureProperty, CreaturePropertyTypes } from '/imports/api/creature/creatureProperties/CreatureProperties';
import { type CheckParams } from '/imports/api/engine/action/functions/userInput/InputProvider';

export type Task = PropTask | DamagePropTask | ItemAsAmmoTask | CheckTask | ResetTask | CastSpellTask;

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
    targetProp: CreatureProperty,// | { name: string, };
  };
}

export type ItemAsAmmoTask = BaseTask & {
  subtaskFn: 'consumeItemAsAmmo';
  prop: CreatureProperty;
  silent?: undefined;
  params: {
    value: number;
    item: CreatureProperty;
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
