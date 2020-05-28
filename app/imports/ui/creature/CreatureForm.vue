<template lang="html">
  <div class="creature-form">
    <text-field
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      :debounce-time="debounceTime"
      :disabled="disabled"
      @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
    />
    <text-field
      label="Alignment"
      :value="model.alignment"
      :error-messages="errors.alignment"
      :debounce-time="debounceTime"
      :disabled="disabled"
      @change="(value, ack) => $emit('change', {path: ['alignment'], value, ack})"
    />
    <text-field
      label="Gender"
      :value="model.gender"
      :error-messages="errors.gender"
      :debounce-time="debounceTime"
      :disabled="disabled"
      @change="(value, ack) => $emit('change', {path: ['gender'], value, ack})"
    />
    <text-field
      label="Picture URL"
      hint="A link to a high resolution image"
      :value="model.picture"
      :error-messages="errors.picture"
      :debounce-time="debounceTime"
      :disabled="disabled"
      @change="(value, ack) => $emit('change', {path: ['picture'], value, ack})"
    />
    <text-field
      label="Avatar picture URL"
      hint="A link to a smaller, square image to use as an avatar"
      :value="model.avatarPicture"
      :error-messages="errors.avatarPicture"
      :debounce-time="debounceTime"
      :disabled="disabled"
      @change="(value, ack) => $emit('change', {path: ['avatarPicture'], value, ack})"
    />
    <form-sections>
      <form-section name="settings">
        <v-switch
          label="Hide redundant stats"
          :input-value="model.settings.hideUnusedStats"
          :disabled="disabled"
          @change="value => $emit('change', {path: ['settings','hideUnusedStats'], value: !!value})"
        />
        <text-field
          label="Hit Dice reset multiplier"
          hint="What fraction of your hit dice are reset every long rest"
          placeholder="0.5"
          type="number"
          min="0"
          max="1"
          step="0.1"
          :value="model.settings.hitDiceResetMultiplier"
          :debounce-time="debounceTime"
          :disabled="disabled"
          @change="(value, ack) => $emit('change', {path: ['settings','hitDiceResetMultiplier'], value, ack})"
        />
      <!--
				<v-switch
					label="Use variant encumbrance"
					:input-value="model.settings.useVariantEncumbrance"
					:error-messages="errors.useVariantEncumbrance"
          :disabled="disabled"
					@change="value => $emit('change', {path: ['settings','useVariantEncumbrance'], value})"
				/>
				<v-switch
					label="Hide spells tab"
					:input-value="model.settings.hideSpellcasting"
					:error-messages="errors.hideSpellcasting"
          :disabled="disabled"
					@change="value => $emit('change', {path: ['settings','hideSpellcasting'], value})"
				/>
				<v-switch
					label="Swap ability scores and modifiers"
					:input-value="model.settings.swapStatAndModifier"
					:error-messages="errors.swapStatAndModifier"
          :disabled="disabled"
					@change="value => $emit('change', {path: ['settings','swapStatAndModifier'], value})"
				/>
        -->
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
    disabled: Boolean,
	},
};
</script>

<style lang="css" scoped>
</style>
