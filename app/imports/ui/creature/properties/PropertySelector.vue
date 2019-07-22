<template lang="html">
	<div>
		<v-container fluid grid-list-lg fill-height>
			<v-layout row wrap>
				<v-flex v-for="property in properties" :key="property.name" xs4>
					<v-card hover @click="$emit('select', property)">
						<div class="layout row align-center justify-center" style="min-height: 70px;">
							<v-icon x-large>{{ property.icon }}</v-icon>
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
export default {
	data(){return {
		properties: [
			{name: 'Creature', icon: 'accessibility', type: 'creature'},
			{name: 'Action', icon: 'offline-bolt', type: 'action'},
			{name: 'Attribute', icon: 'star-rate', type: 'attribute'},
			{name: 'Buff', icon: 'star', type: 'buff'},
			{name: 'Class', icon: 'school', type: 'class'},
			{name: 'Class Level', icon: 'plus-one', type: 'classLevel'},
			{name: 'Damage Multiplier', icon: 'layers', type: 'damageMultiplier'},
			{name: 'Effect', icon: 'show-chart', type: 'effect'},
			{name: 'Experience', icon: 'add', type: 'experience'},
			{name: 'Feature', icon: 'subject', type: 'feature'},
			{name: 'Folder', icon: 'folder', type: 'folder'},
			{name: 'Note', icon: 'note', type: 'note'},
			{name: 'Proficiency', icon: 'radio-button-checked', type: 'proficiency'},
			{name: 'Roll', icon: 'dice', type: 'roll'},
			{name: 'Skill', icon: 'check-box', type: 'skill'},
			{name: 'Spell List', icon: 'list', type: 'spellList'},
			{name: 'Spell', icon: 'whatshot', type: 'spell'},
			{name: 'Container', icon: 'work', type: 'container'},
			{name: 'Item', icon: 'category', type: 'item'},
		],
	}}
}
</script>

<style lang="css" scoped>
</style>
