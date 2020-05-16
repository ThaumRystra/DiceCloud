<template lang="html">
  <div class="creature-form">
    <text-field
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
    />
    <text-field
      label="Alignment"
      :value="model.alignment"
      :error-messages="errors.alignment"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['alignment'], value, ack})"
    />
    <text-field
      label="Gender"
      :value="model.gender"
      :error-messages="errors.gender"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['gender'], value, ack})"
    />
    <text-field
      label="Picture URL"
      hint="A link to a high resolution image"
      :value="model.picture"
      :error-messages="errors.picture"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['picture'], value, ack})"
    />
    <text-field
      label="Avatar picture URL"
      hint="A link to a smaller, square image to use as an avatar"
      :value="model.avatarPicture"
      :error-messages="errors.avatarPicture"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['avatarPicture'], value, ack})"
    />
    <!--
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
    -->
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
};
</script>

<style lang="css" scoped>
</style>
