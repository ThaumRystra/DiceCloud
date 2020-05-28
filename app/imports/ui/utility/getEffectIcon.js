export default function getEffectIcon(op, value){
  switch(op) {
    case 'base': return 'forward';
    case 'add': return value < 0 ? 'remove' : 'add';
    case 'mul': return 'clear';
    case 'min': return 'unfold_more';
    case 'max': return 'unfold_less';
    case 'set': return 'push_pin';
    case 'advantage': return 'arrow_upward';
    case 'disadvantage': return 'arrow_downward';
    case 'passiveAdd': return value < 0 ? 'remove_circle_outline' : 'add_circle_outline';
    case 'fail': return 'block';
    case 'conditional': return '*' ;
  }
}
