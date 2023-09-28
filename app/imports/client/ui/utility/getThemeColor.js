import vuetify from '/imports/client/ui/vuetify';

export default function (color) {
  return vuetify.framework.theme.dark ?
    vuetify.framework.theme.themes.dark[color] :
    vuetify.framework.theme.themes.light[color];
}
