export default function getEffectIcon(op, value){
  switch(op) {
    case 'base': return 'mdi-forward';
    case 'add': return value < 0 ? 'mdi-minus' : 'mdi-plus';
    case 'mul': return 'mdi-close';
    case 'min': return 'mdi-arrow-expand-up';
    case 'max': return 'mdi-arrow-expand-down';
    case 'set': return 'mdi-pin';
    case 'advantage': return 'mdi-chevron-double-up';
    case 'disadvantage': return 'mdi-chevron-double-down';
    case 'passiveAdd': return value < 0 ? 'mdi-minus-circle-outline' : 'mdi-plus-circle-outline';
    case 'fail': return 'mdi-cancel';
    case 'conditional': return 'mdi-asterisk' ;
  }
}
