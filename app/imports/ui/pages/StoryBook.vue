<template lang="html">
	<toolbar-layout>
    <div slot="toolbar">
      Storybook
    </div>
		<v-navigation-drawer right app>
			<v-toolbar color="primary" dark>
				Components
			</v-toolbar>
			<v-list>
	      <v-list-tile
					v-for="(component, componentName) in $options.components"
					v-if="componentName !== 'story-book' && componentName !== 'ToolbarLayout'"
	        :key="componentName"
					@click=""
					:to="`/storybook/${componentName}`"
	      >
	        <v-list-tile-content>
	          <v-list-tile-title>{{componentName}}</v-list-tile-title>
	        </v-list-tile-content>
	      </v-list-tile>
	    </v-list>
		</v-navigation-drawer>
    <div class="content">
			<v-card class="ma-4">
				<component :is="$route.params.component"></component>
			</v-card>
		</div>
	</toolbar-layout>
</template>

<script>
	import ToolbarLayout from "/imports/ui/layouts/ToolbarLayout.vue";
	import HealthBar from '/imports/ui/components/HealthBar.Story.vue';
	import SkillListTile from '/imports/ui/components/SkillListTile.Story.vue';
	import AbilityListTile from '/imports/ui/components/AbilityListTile.Story.vue';
	export default {
		components: {
			ToolbarLayout,
			HealthBar,
			SkillListTile,
			AbilityListTile,
		},
	}
</script>

<style lang="css" scoped>
</style>
