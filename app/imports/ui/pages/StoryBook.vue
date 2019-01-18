<template lang="html">
	<toolbar-layout>
    <v-layout row slot="toolbar" align-center>
			<div>
				Storybook
			</div>
			<v-flex/>
			<v-btn flat icon @click="sidebar = !sidebar">
				<v-icon>menu</v-icon>
			</v-btn>
    </v-layout>
		<v-navigation-drawer right app v-model="sidebar">
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
	import ToolbarLayout from '/imports/ui/layouts/ToolbarLayout.vue';
	import HealthBar from '/imports/ui/components/HealthBar.Story.vue';
	import SkillListTile from '/imports/ui/components/SkillListTile.Story.vue';
	import AbilityListTile from '/imports/ui/components/AbilityListTile.Story.vue';
	import AttributeCard from '/imports/ui/components/AttributeCard.Story.vue';
	export default {
		components: {
			ToolbarLayout,
			HealthBar,
			SkillListTile,
			AbilityListTile,
			AttributeCard,
		},
		data(){ return {
			sidebar: undefined,
		}},
	}
</script>

<style lang="css" scoped>
</style>
