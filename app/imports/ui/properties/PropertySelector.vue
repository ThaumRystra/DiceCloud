<template lang="html">
	<div>
		<v-container fluid grid-list-lg fill-height>
			<v-layout row wrap>
				<v-flex v-for="property in properties" :key="property.name" xs4>
					<v-card hover @click="$emit('select', property)">
						<div class="layout row align-center justify-center" style="min-height: 70px;">
							<v-icon x-large>{{ icon(property.type) }}</v-icon>
						</div>
						<h3 class="subtitle pb-3" style="text-align: center;">
							{{ property.name }}
						</h3>
					</v-card>
				</v-flex>
			</v-layout>
		</v-container>
	</div>
</template>

<script>
import PROPERTY_ICONS from '/imports/constants/PROPERTY_ICONS.js';
export default {
	data(){return {
		properties: [
			{name: 'Action', icon: 'offline_bolt', type: 'action'},
			{name: 'Attribute', icon: 'donut_small', type: 'attribute'},
			{name: 'Buff', icon: 'star', type: 'buff'},
			{name: 'Class Level', icon: 'school', type: 'classLevel'},
			{name: 'Damage Multiplier', icon: 'layers', type: 'damageMultiplier'},
			{name: 'Effect', icon: 'show_chart', type: 'effect'},
			{name: 'Experience', icon: 'add', type: 'experience'},
			{name: 'Feature', icon: 'subject', type: 'feature'},
			{name: 'Folder', icon: 'folder', type: 'folder'},
			{name: 'Note', icon: 'note', type: 'note'},
			{name: 'Proficiency', icon: 'radio_button_checked', type: 'proficiency'},
			{name: 'Roll', icon: 'flare', type: 'roll'},
			{name: 'Skill', icon: 'check_box', type: 'skill'},
			{name: 'Spell List', icon: 'list', type: 'spellList'},
			{name: 'Spell', icon: 'whatshot', type: 'spell'},
			{name: 'Container', icon: 'work', type: 'container'},
			{name: 'Item', icon: 'category', type: 'item'},
		],
	}},
	methods: {
		icon(type){
			return PROPERTY_ICONS[type];
		},
	}
}
</script>

<style lang="css" scoped>
</style>
