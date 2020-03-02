<template lang="html">
	<div class="creature-form">
		<text-field
			label="Name"
			:value="model.name"
			@change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
			:error-messages="errors.name"
			:debounce-time="debounceTime"
		/>
		<text-field
			label="Alignment"
			:value="model.alignment"
			@change="(value, ack) => $emit('change', {path: ['alignment'], value, ack})"
			:error-messages="errors.alignment"
			:debounce-time="debounceTime"
		/>
		<text-field
			label="Gender"
			:value="model.gender"
			@change="(value, ack) => $emit('change', {path: ['gender'], value, ack})"
			:error-messages="errors.gender"
			:debounce-time="debounceTime"
		/>
		<text-field
			label="Picture URL"
			:value="model.picture"
			@change="(value, ack) => $emit('change', {path: ['picture'], value, ack})"
			:error-messages="errors.picture"
			:debounce-time="debounceTime"
		/>
		<form-sections>
			<form-section name="settings">
				<v-switch
					label="Use variant encumbrance"
					:input-value="model.settings.useVariantEncumbrance"
					:error-messages="errors.useVariantEncumbrance"
					@change="value => $emit('change', {path: ['settings','useVariantEncumbrance'], value})"
				/>
				<v-switch
					label="Hide spells tab"
					:input-value="model.settings.hideSpellcasting"
					:error-messages="errors.hideSpellcasting"
					@change="value => $emit('change', {path: ['settings','hideSpellcasting'], value})"
				/>
				<v-switch
					label="Swap ability scores and modifiers"
					:input-value="model.settings.swapStatAndModifier"
					:error-messages="errors.swapStatAndModifier"
					@change="value => $emit('change', {path: ['settings','swapStatAndModifier'], value})"
				/>
			</form-section>
		</form-sections>
	</div>
</template>

<script>
import FormSection, {FormSections} from '/imports/ui/properties/forms/shared/FormSection.vue';

export default {
	components: {
		FormSection,
		FormSections,
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
		attackForm: {
			type: Boolean,
		},
		debounceTime: Number,
	},
	methods: {
		log: console.log,
	}
};
</script>

<style lang="css" scoped>
</style>
