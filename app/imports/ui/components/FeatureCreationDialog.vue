<template lang="html">
	<dialog-base>
		<div slot="toolbar">
			New Feature
		</div>
		<feature-edit
			:feature="feature"
			:errors="errors"
			@change="change"
			:debounce-time="0"
		/>
		<v-spacer slot="actions"/>
		<v-btn
			flat
			slot="actions"
			:disabled="!valid"
			@click="$store.dispatch('popDialogStack', feature)"
		>
			Insert Feature
		</v-btn>
	</dialog-base>
</template>

<script>
	import FeatureEdit from '/imports/ui/components/FeatureEdit.vue';
	import Features from '/imports/api/creature/properties/Features.js';
	import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';

	export default {
		components: {
			FeatureEdit,
			DialogBase,
		},
		data(){ return {
			feature: {
				name: 'New Feature',
				description: null,
				uses: null,
				used: 0,
				reset: null,
				enabled: true,
				alwaysEnabled: true,
				color: '#9E9E9E',
			},
			valid: true,
		}},
		methods: {
			change(update, ack){
				for (key in update){
					this.feature[key] = update[key];
				}
				if (ack) ack();
			},
		},
		created(){
			this.validationContext = Features.simpleSchema().newContext();
		},
		computed: {
			errors(){
				this.valid = true;
				let cleanAtt = this.validationContext.clean(this.feature)
				this.validationContext.validate(cleanAtt, {keys: [
					'name', 'description', 'uses', 'used', 'reset', 'enabled',
					'alwaysEnabled', 'color',
				]});
				let errors = {};
				this.validationContext.validationErrors().forEach(error => {
					if (this.valid) this.valid = false;
					errors[error.name] = Features.simpleSchema().messageForError(error);
				});
				return errors;
			},
		},
	};
</script>

<style lang="css" scoped>
</style>
