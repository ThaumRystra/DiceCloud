import { CheckParams } from '/imports/api/engine/action/functions/userInput/InputProvider';

type Task = PropTask | DamagePropTask | ItemAsAmmoTask | CheckTask;

export default Task;

type BaseTask = {
  prop: { [key: string]: any };
  targetIds: string[];
}

export type PropTask = BaseTask & {
  subtaskFn?: undefined,
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
    targetProp: any;
  };
}

export type ItemAsAmmoTask = BaseTask & {
  subtaskFn: 'consumeItemAsAmmo';
  params: {
    value: number;
    item: any;
  };
}

export type CheckTask = BaseTask & CheckParams & {
  subtaskFn: 'check';
}
