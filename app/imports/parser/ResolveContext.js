export default class Context {
  constructor({errors = [], rolls = []}){
    this.errors = errors;
    this.rolls = rolls;
  }
  error(e){
    if (!e) return;
    if (typeof e === 'string'){
      this.errors.push({
        type: 'error',
        message: e,
      });
    } else {
      this.errors.push(e);
    }
  }
  roll(r){
    this.rolls.push(r);
  }
}
