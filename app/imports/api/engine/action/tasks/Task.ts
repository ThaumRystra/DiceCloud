type Task = PropTask | DamagePropTask | ItemAsAmmoTask;

export default Task;

interface BaseTask {
  prop: { [key: string]: any };
  targetIds: string[];
}

export interface PropTask extends BaseTask {
  subtaskFn?: undefined,
}

export interface DamagePropTask extends BaseTask {
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

export interface ItemAsAmmoTask extends BaseTask {
  subtaskFn: 'consumeItemAsAmmo';
  params: {
    value: number;
    item: any;
  };
}
