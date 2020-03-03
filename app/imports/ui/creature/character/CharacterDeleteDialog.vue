<template lang="html">
  <dialog-base>
		<div slot="toolbar">
			Delete Character
		</div>
		<div>
			<p v-if="name">
				Type "{{name}}" to permanenetly delete the character
			</p>
			<v-text-field v-if="name" v-model="inputName"/>
			<v-btn v-show="nameMatch" class="primary" @click="remove">Delete forever</v-btn>
		</div>
		<v-spacer slot="actions"/>
		<v-btn
			slot="actions"
			flat
			@click="$store.dispatch('popDialogStack')"
		>Cancel</v-btn>
	</dialog-base>
</template>

<script>
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import removeCreature from '/imports/api/creature/removeCreature.js';

export default {
	components: {
		DialogBase,
	},
	props: {
		id: String,
	},
	data(){return {
		inputName: undefined,
	}},
	computed: {
		nameMatch(){
			if (!this.name) return true;
			let uppername = this.name.toUpperCase();
			let upperInputName = this.inputName && this.inputName.toUpperCase();
			return uppername === upperInputName;
		},
	},
	meteor: {
		name(){
			let creature = Creatures.findOne(this.id);
			return creature && creature.name;
		},
	},
	methods: {
		remove(){
			removeCreature.call({charId: this.id}, (error, result) => {
				if (error) {
					console.error(error);
				} else {
					this.$router.push('/characterList');
					this.$store.dispatch('popDialogStack');
				}
			});
		}
	}
};
</script>

<style lang="css" scoped>
</style>
