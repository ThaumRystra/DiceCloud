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
				<v-switch :input-value="darkMode" @change="setDarkMode" label="Dark mode"/>
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
	import AbilityListTile from '/imports/ui/properties/components/attributes/AbilityListTile.Story.vue';
	import AttributeCard from '/imports/ui/properties/components/attributes/AttributeCard.Story.vue';
	import ColorPicker from '/imports/ui/components/ColorPicker.Story.vue';
	import ColumnLayout from "/imports/ui/components/ColumnLayout.Story.vue";
	import DialogStack from '/imports/ui/dialogStack/DialogStack.Story.vue';
	import EffectEditExpansionList from '/imports/ui/properties/viewers/shared/effects/EffectEditExpansionList.Story.vue';
	import FeatureCard from '/imports/ui/properties/components/features/FeatureCard.Story.vue';
	import HealthBar from '/imports/ui/properties/components/attributes/HealthBar.Story.vue';
	import HitDiceListTile from '/imports/ui/properties/components/attributes/HitDiceListTile.Story.vue';
	// import IconSearch from '/imports/ui/components/IconSearch.Story.vue';
	import ResourceCard from '/imports/ui/properties/components/attributes/ResourceCard.Story.vue';
	import SkillListTile from '/imports/ui/properties/components/skills/SkillListTile.Story.vue';
	import SmartInput from '/imports/ui/components/global/SmartInput.Story.vue';
	import SpellSlotListTile from '/imports/ui/properties/components/attributes/SpellSlotListTile.Story.vue';
	import ToolbarLayout from '/imports/ui/layouts/ToolbarLayout.vue';

	export default {
		components: {
			AbilityListTile,
			AttributeCard,
			ColorPicker,
			ColumnLayout,
			DialogStack,
			EffectEditExpansionList,
			FeatureCard,
			HealthBar,
			HitDiceListTile,
			// IconSearch,
			ResourceCard,
			SkillListTile,
			SmartInput,
			SpellSlotListTile,
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
		methods: {
			setDarkMode(value){
				Meteor.users.setDarkMode.call({darkMode: !!value});
			},
		},
		meteor: {
			darkMode(){
				let user = Meteor.user();
				return user && user.darkMode;
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
