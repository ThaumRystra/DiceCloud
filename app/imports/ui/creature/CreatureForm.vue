<template lang="html">
  <div class="creature-form">
    <text-field
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
    />
    <text-field
      label="Alignment"
      :value="model.alignment"
      :error-messages="errors.alignment"
      @change="(value, ack) => $emit('change', {path: ['alignment'], value, ack})"
    />
    <text-field
      label="Gender"
      :value="model.gender"
      :error-messages="errors.gender"
      @change="(value, ack) => $emit('change', {path: ['gender'], value, ack})"
    />
    <text-field
      label="Picture URL"
      hint="A link to a high resolution image"
      :value="model.picture"
      :error-messages="errors.picture"
      @change="(value, ack) => $emit('change', {path: ['picture'], value, ack})"
    />
    <text-field
      label="Avatar picture URL"
      hint="A link to a smaller, square image to use as an avatar"
      :value="model.avatarPicture"
      :error-messages="errors.avatarPicture"
      @change="(value, ack) => $emit('change', {path: ['avatarPicture'], value, ack})"
    />
    <form-sections>
      <form-section name="settings">
        <v-switch
          label="Hide redundant stats"
          :input-value="model.settings.hideUnusedStats"
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
          @change="(value, ack) => $emit('change', {path: ['settings','hitDiceResetMultiplier'], value, ack})"
        />
        <text-field
          label="Discord Webhook URL"
          hint="This creature's logs will be posted to the discord channel"
          placeholder="https://discordapp.com/api/webhooks/<id>/<token>"
          :value="model.settings.discordWebhook"
          @change="(value, ack) => $emit('change', {path: ['settings','discordWebhook'], value, ack})"
        />
      <!--
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
        -->
      </form-section>
    </form-sections>
  </div>
</template>

<script lang="js">
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
    disabled: Boolean,
	},
};
</script>

<style lang="css" scoped>
</style>
