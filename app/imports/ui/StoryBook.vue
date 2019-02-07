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
			<v-toolbar color="secondary" dark>
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
	import AttributeEdit from '/imports/ui/components/AttributeEdit.Story.vue';
	import ColorPicker from '/imports/ui/components/ColorPicker.Story.vue';
	import ColumnLayout from "/imports/ui/components/ColumnLayout.Story.vue";
	import DialogStack from '/imports/ui/dialogStack/DialogStack.Story.vue';
	import EffectEdit from '/imports/ui/components/EffectEdit.Story.vue';
	import HealthBar from '/imports/ui/components/HealthBar.Story.vue';
	import HitDiceListTile from '/imports/ui/components/HitDiceListTile.Story.vue';
	import IconSearch from '/imports/ui/components/IconSearch.Story.vue';
	import SkillListTile from '/imports/ui/components/SkillListTile.Story.vue';
	import SmartInput from '/imports/ui/components/global/SmartInput.Story.vue';
	import ToolbarLayout from '/imports/ui/layouts/ToolbarLayout.vue';

	export default {
		components: {
			AbilityListTile,
			AttributeCard,
			AttributeEdit,
			ColorPicker,
			ColumnLayout,
			DialogStack,
			EffectEdit,
			HealthBar,
			HitDiceListTile,
			IconSearch,
			SkillListTile,
			SmartInput,
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
