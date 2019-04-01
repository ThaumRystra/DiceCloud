<template lang="html">
	<dialog-base>
		<template slot="toolbar">
			<div>
				New {{documentType}}
			</div>
		</template>
		<template #default>
			<slot @update="update"/>
		</template>
		<template slot="actions">
			<v-spacer/>
			<v-btn
				flat
				:disabled="!valid"
				@click="$store.dispatch('popDialogStack', doc)"
			>
				Insert {{documentType}}
			</v-btn>
		</template>
	</dialog-base>
</template>

<script>
import Vue from 'vue';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';

export default {
	components: {
		DialogBase,
	},
	props: {
		documentType: String,
		schema: Object,
		doc: Object,
	},
	data(){ return {
		valid: true,
	}},
	watch: {
		doc: {
			handler(newDoc){
				let validationContext = this.schema.newContext();
				this.valid = true;
				let cleanAtt = validationContext.clean(newDoc)
				validationContext.validate(cleanAtt, {keys: [
					'name', 'description', 'uses', 'used', 'reset', 'enabled',
					'alwaysEnabled', 'color',
				]});
				let errors = {};
				validationContext.validationErrors().forEach(error => {
					if (this.valid) this.valid = false;
					errors[error.name] = this.schema.messageForError(error);
				});
				this.$emit('updateErrors', errors);
			},
			deep: true,
		},
	},
	methods: {
		log: console.log
	}
};
</script>

<style lang="css" scoped>
</style>
