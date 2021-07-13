export default function getProficiencyIcon(proficiency){
  if (proficiency == 0.49){
    return 'mdi-brightness-3';
  } else if (proficiency == 0.5){
    return 'mdi-brightness-2';
  } else if (proficiency == 1) {
    return 'mdi-brightness-1'
  } else if (proficiency == 2){
    return 'mdi-album'
  } else {
    return 'mdi-radiobox-blank';
  }
}
