type RollMade = { number: number; diceSize: number; values: number[]; };
export default class Context {
  errors: { type: string; message: string }[];
  rolls: RollMade[];
  options: { [key: string]: unknown; };

  constructor({ errors = [], rolls = [], options = {} } = {}) {
    this.errors = errors;
    this.rolls = rolls;
    this.options = options;
  }

  error(e: Error | string) {
    if (!e) return;
    if (typeof e === 'string') {
      this.errors.push({
        type: 'error',
        message: e,
      });
    } else {
      this.errors.push({
        type: 'error',
        message: e.message,
      });
    }
  }

  roll(r: RollMade) {
    this.rolls.push(r);
  }
}
