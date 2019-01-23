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
			<component v-if="dontWrap" :is="$route.params.component"/>
			<v-card class="ma-4" v-else="dontWrap">
				<component :is="$route.params.component"/>
			</v-card>
		</div>
	</toolbar-layout>
</template>

<script>
	import Vue from "vue";
	import AbilityListTile from '/imports/ui/components/AbilityListTile.Story.vue';
	import AttributeCard from '/imports/ui/components/AttributeCard.Story.vue';
	import ColumnLayout from "/imports/ui/components/ColumnLayout.Story.vue";
	import DialogStack from '/imports/ui/dialogStack/DialogStack.Story.vue';
	import HealthBar from '/imports/ui/components/HealthBar.Story.vue';
	import HitDiceListTile from '/imports/ui/components/HitDiceListTile.Story.vue';
	import SkillListTile from '/imports/ui/components/SkillListTile.Story.vue';
	import ToolbarLayout from '/imports/ui/layouts/ToolbarLayout.vue';
	export default {
		components: {
			AbilityListTile,
			AttributeCard,
			ColumnLayout,
			DialogStack,
			HealthBar,
			HitDiceListTile,
			SkillListTile,
			ToolbarLayout,
		},
		data(){ return {
			sidebar: undefined,
		}},
		computed: {
			dontWrap(){
				let component = this.$options.components[this.$route.params.component];
				return component && component.dontWrap;
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
