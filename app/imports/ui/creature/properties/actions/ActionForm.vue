<template lang="html">
  <div class="action-form">
		<text-field
			label="Name"
			:value="model.name"
			@change="(name, ack) => $emit('change', {name}, ack)"
			:error-messages="errors.name"
			:debounce-time="debounceTime"
		/>
		<smart-select
			label="Type"
			:items="actionTypes"
			:value="model.type"
			:error-messages="errors.type"
			:menu-props="{auto: true, lazy: true}"
			@change="(type, ack) => $emit('change', {type}, ack)"
			:hint="actionTypeHints[model.type]"
			:debounce-time="debounceTime"
		/>
		<form-sections>
			<form-section name="Advanced">
				<smart-select
					label="Target"
					style="flex-basis: 300px;"
					:items="targetOptions"
					:value="model.target"
					:error-messages="errors.target"
					:menu-props="{auto: true, lazy: true}"
					@change="(target, ack) => $emit('change', {target}, ack)"
					:debounce-time="debounceTime"
				/>
				<div class="layout row wrap">
					<text-field
						label="Uses"
						hint="How many times this action can be used before needing to be reset"
						style="flex-basis: 300px;"
						:value="model.uses"
						@change="(uses, ack) => $emit('change', {uses}, ack)"
						:error-messages="errors.uses"
						:debounce-time="debounceTime"
					/>
					<text-field
						label="Uses used"
						type="number"
						hint="How many times this action has already been used"
						style="flex-basis: 300px;"
						:value="model.usesUsed"
						@change="(uses, ack) => $emit('change', {uses}, ack)"
						:error-messages="errors.uses"
						:debounce-time="debounceTime"
					/>
				</div>
				<smart-select
					label="Reset"
					clearable
					style="flex-basis: 300px;"
					:items="resetOptions"
					:value="model.reset"
					:error-messages="errors.reset"
					:menu-props="{auto: true, lazy: true}"
					@change="(reset, ack) => $emit('change', {reset}, ack)"
					:debounce-time="debounceTime"
				/>
			</form-section>
			<form-section name="Adjustments">
				<div class="caption">
					Adjustments can be used to automatically spend resources or deal
					damage when taking an action.
					They apply damage to an attribute each time the action is taken.
				</div>
				<adjustment-list-form
					:model="model.adjustments"
					:parent-target="model.target"
					@push="(adjustments, ack) => $emit('push', {adjustments}, ack)"
					@changeAtIndex="(index, modifier, ack) => $emit('changeAtIndex', 'adjustments', index, modifier, ack)"
					@removeAtIndex="(index, ack) => $emit('removeAtIndex', 'adjustments', index, ack)"
				/>
			</form-section>
		</form-sections>
  </div>
</template>

<script>
	import FormSection, {FormSections} from '/imports/ui/components/forms/FormSection.vue';
	import AdjustmentListForm from '/imports/ui/creature/properties/adjustments/AdjustmentListForm.vue';

	export default {
		components: {
			FormSection,
			FormSections,
			AdjustmentListForm,
		},
		props: {
			model: {
				type: Object,
				default: () => ({}),
			},
			errors: {
				type: Object,
				default: () => ({}),
			},
			debounceTime: Number,
		},
		data(){
			let data = {
				actionTypes: [
					{
						text: 'Action',
						value: 'action',
					}, {
						text: 'Bonus action',
						value: 'bonus',
					}, {
						text: 'Attack action',
						value: 'attack',
						help: 'Attack actions replace a single attack when you choose to use your Action to attack',
					}, {
						text: 'Reaction',
						value: 'reaction',
					}, {
						text: 'Free action',
						value: 'free',
						help: 'You can take one free action on your turn without using an action or bonus action'
					}, {
						text: 'Long action',
						value: 'long',
						help: 'Long actions take longer than one turn to complete'
					},
				],
				targetOptions: [
					{
						text: 'Self',
						value: 'self',
					}, {
						text: 'Single target',
						value: 'singleTarget',
					}, {
						text: 'Multiple targets',
						value: 'multipleTargets',
					},
				],
				resetOptions: [
					{
						text: 'Short rest',
						value: 'shortRest',
					}, {
						text: 'Long rest',
						value: 'longRest',
					}
				],
			};
			data.actionTypeHints = {};
			data.actionTypes.forEach(type => {
				data.actionTypeHints[type.value] = type.help;
			});
			return data;
		},
	};
</script>

<style lang="css" scoped>
	.no-flex {
		flex: initial;
	}
	.layout.row.wrap {
		margin-right: -8px;
	}
	.layout.row.wrap > *{
		margin-right: 8px;
	}
</style>
