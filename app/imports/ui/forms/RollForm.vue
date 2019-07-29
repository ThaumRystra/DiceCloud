<template lang="html">
  <div class="roll-form">
		<text-field
			label="Roll"
			hint="The roll will be calculated using the rolling character's stats"
			:value="model.roll"
			@change="(value, ack) => $emit('change', {path: ['roll'], value, ack})"
			:error-messages="errors.roll"
			:debounce-time="debounceTime"
		/>
		<text-field
			label="Target number"
			hint="The target number or stat to meet or exceed, calculated from the target's stats"
			:value="model.targetNumber"
			@change="(value, ack) => $emit('change', {path: ['targetNumber'], value, ack})"
			:error-messages="errors.targetNumber"
			:debounce-time="debounceTime"
		/>
		<smart-select
			label="Type"
			:items="rollTypes"
			:value="model.rollType"
			:error-messages="errors.rollType"
			:menu-props="{auto: true, lazy: true}"
			@change="(value, ack) => $emit('change', {path: ['rollType'], value, ack})"
			:debounce-time="debounceTime"
		/>
		<v-combobox
	    label="Tags"
	    multiple
			chips
			deletable-chips
			box
			:value="model.tags"
			@change="(value) => $emit('change', {path: ['tags'], value})"
	  />
		<form-sections>
			<form-section name="Advanced">
				<v-switch
					label="Only roll if the parent roll misses"
					:input-value="model.onMiss"
					:error-messages="errors.onMiss"
					@change="e => $emit('change', {path: ['onMiss'], value: !!e})"
				/>
				<v-switch
					label="Swap who wins ties"
					:input-value="model.invertTies"
					:error-messages="errors.invertTies"
					@change="e => $emit('change', {path: ['invertTies'], value: !!e})"
				/>
			</form-section>
			<form-section name="Damage and Adjustments on Hit">
				<div class="caption">
					Adjustments can be used to automatically spend resources or deal
					damage when taking an roll.
					These apply when a roll suceeds.
				</div>
				<adjustment-list-form
					:model="model.hit.adjustments"
					@change="({path, value, ack}) => $emit('change', {path: ['hit', 'adjustments', ...path], value, ack})"
					@push="({path, value, ack}) => $emit('push', {path: ['hit', 'adjustments', ...path], value, ack})"
					@pull="({path, ack}) => $emit('pull', {path: ['hit', 'adjustments', ...path], ack})"
				/>
			</form-section>
			<form-section name="Buffs on Hit">
				<div class="caption">
					Buffs apply temporary effects to characters when the roll succeeds.
				</div>
				<buff-list-form
					:model="model.hit.buffs"
					:stored="stored"
					@change="({path, value, ack}) => $emit('change', {path: ['hit', 'buffs', ...path], value, ack})"
					@push="({path, value, ack}) => $emit('push', {path: ['hit', 'buffs', ...path], value, ack})"
					@pull="({path, ack}) => $emit('pull', {path: ['hit', 'buffs', ...path], ack})"
				/>
			</form-section>
			<form-section name="Damage and Adjustments on Miss">
				<div class="caption">
					Adjustments can be used to automatically spend resources or deal
					damage when taking an roll.
					These apply when a roll fails.
				</div>
				<adjustment-list-form
					:model="model.miss.adjustments"
					@change="({path, value, ack}) => $emit('change', {path: ['miss', 'adjustments', ...path], value, ack})"
					@push="({path, value, ack}) => $emit('push', {path: ['miss', 'adjustments', ...path], value, ack})"
					@pull="({path, ack}) => $emit('pull', {path: ['miss', 'adjustments', ...path], ack})"
				/>
			</form-section>
			<form-section name="Buffs on Miss">
				<div class="caption">
					Buffs apply temporary effects to characters when the roll fails.
				</div>
				<buff-list-form
					:model="model.miss.buffs"
					:stored="stored"
					@change="({path, value, ack}) => $emit('change', {path: ['miss', 'buffs', ...path], value, ack})"
					@push="({path, value, ack}) => $emit('push', {path: ['miss', 'buffs', ...path], value, ack})"
					@pull="({path, ack}) => $emit('pull', {path: ['miss', 'buffs', ...path], ack})"
				/>
			</form-section>
		</form-sections>
  </div>
</template>

<script>
	import FormSection, {FormSections} from '/imports/ui/forms/components/FormSection.vue';
	import AdjustmentListForm from '/imports/ui/forms/AdjustmentListForm.vue';
	import BuffListForm from '/imports/ui/forms/BuffListForm.vue';

	export default {
		components: {
			FormSection,
			FormSections,
			AdjustmentListForm,
			BuffListForm,
		},
		props: {
			stored: {
				type: Boolean,
			},
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
		data(){return {
			rollTypes: [
				{
					text: 'Roll',
					value: 'roll',
				}, {
					text: 'Saving Throw',
					value: 'savingThrow',
				},
			],
		};},
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
