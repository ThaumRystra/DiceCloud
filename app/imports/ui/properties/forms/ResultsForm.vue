<template lang="html">
	<div class="results-form">
		<div class="subheading">
			Damage
		</div>
		<damage-list-form
			:model="model.damages"
			:parent-target="parentTarget"
			@change="({path, value, ack}) => $emit('change', {path: ['damages', ...path], value, ack})"
			@push="({path, value, ack}) => $emit('push', {path: ['damages', ...path], value, ack})"
			@pull="({path, ack}) => $emit('pull', {path: ['damages', ...path], ack})"
		/>
		<div class="subheading">
			Adjustments
		</div>
		<adjustment-list-form
			:model="model.adjustments"
			:parent-target="parentTarget"
			@change="({path, value, ack}) => $emit('change', {path: ['adjustments', ...path], value, ack})"
			@push="({path, value, ack}) => $emit('push', {path: ['adjustments', ...path], value, ack})"
			@pull="({path, ack}) => $emit('pull', {path: ['adjustments', ...path], ack})"
		/>
		<div class="subheading">
			Buffs
		</div>
		<buff-list-form
			:model="model.buffs"
			:parent-target="parentTarget"
			:stored="buffsStored"
			@change="({path, value, ack}) => $emit('change', {path: ['buffs', ...path], value, ack})"
			@push="({path, value, ack}) => $emit('push', {path: ['buffs', ...path], value, ack})"
			@pull="({path, ack}) => $emit('pull', {path: ['buffs', ...path], ack})"
		/>
	</div>
</template>

<script>
	import FormSection, {FormSections} from '/imports/ui/properties/forms/shared/FormSection.vue';
	import AdjustmentListForm from '/imports/ui/properties/forms/AdjustmentListForm.vue';
	import DamageListForm from '/imports/ui/properties/forms/DamageListForm.vue';
	import BuffListForm from '/imports/ui/properties/forms/BuffListForm.vue';
	import ResultsSchema from '/imports/api/properties/subSchemas/ResultsSchema.js';

	export default {
		components: {
			FormSection,
			FormSections,
			AdjustmentListForm,
			DamageListForm,
			BuffListForm,
		},
		data(){return {
			addDamageLoading: false,
			showAddToolbar: false,
		}},
		props: {
			model: {
				type: Object,
				default: () => (ResultsSchema.clean({})),
			},
			parentTarget: {
				type: String,
			},
			buffsStored: {
				type: Boolean,
			},
			debounceTime: Number,
		},
		methods: {
			acknowledgeAddDamage(){
				this.addDamageLoading = false;
			},
			addDamage(){
				this.addDamageLoading = true;
				this.$emit('push', {
					path: [],
					value: DamageSchema.clean({}),
					ack: this.acknowledgeAddDamage,
				});
			},
		},
	}
</script>

<style lang="css" scoped>
</style>
