import vuetify from '/imports/ui/vuetify.js';

export default function(color){
  return vuetify.framework.theme.dark ?
    vuetify.framework.theme.themes.dark[color] :
    vuetify.framework.theme.themes.light[color];
}
