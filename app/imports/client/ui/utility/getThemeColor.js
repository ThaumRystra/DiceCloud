import vuetify from '/imports/client/ui/vuetify';

export default function (color) {
  const currentTheme = vuetify.theme.global.current.value;
  return currentTheme.colors[color];
}
