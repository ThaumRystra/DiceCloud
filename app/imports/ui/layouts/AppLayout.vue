<template>
  <v-app :dark="darkMode" :light="!darkMode">
    <v-navigation-drawer app v-model="drawer">
      <Sidebar/>
    </v-navigation-drawer>
		<router-view></router-view>
    <dialog-stack></dialog-stack>
  </v-app>
</template>

<script>
	import '/imports/api/users/Users.js';
  import Sidebar from "/imports/ui/layouts/Sidebar.vue";
  import DialogStack from "/imports/ui/dialogStack/DialogStack.vue";
	import { theme, darkTheme } from '/imports/ui/theme.js';
  export default {
    computed: {
      drawer: {
        get () {
          return this.$store.state.drawer;
        },
        set (value) {
          this.$store.commit('setDrawer', value);
        },
      },
    },
    components: {
      Sidebar,
      DialogStack,
    },
		meteor: {
			$subscribe: {
				'user': [],
			},
			darkMode(){
				let user = Meteor.user();
				return user && user.darkMode;
			},
		},
		watch: {
			darkMode: {
				immediate: true,
				handler(newDarkModeValue){
					let newTheme = newDarkModeValue ? darkTheme : theme;
					for (let key in newTheme){
						this.$vuetify.theme[key] = newTheme[key];
					}
				},
			},
		},
  };
</script>

<style>

</style>
