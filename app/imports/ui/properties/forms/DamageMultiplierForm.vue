<template lang="html">
  <div class="attribute-form">
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <div class="layout row wrap">
      <smart-select
        label="Damage Type"
        style="flex-basis: 300px;"
        multiple
        :items="damageTypes"
        :value="model.damageTypes"
        :error-messages="errors.damageTypes"
        :menu-props="{auto: true, lazy: true}"
        @change="change('damageTypes', ...arguments)"
      />
      <smart-select
        label="Value"
        style="flex-basis: 300px;"
        :items="values"
        :value="model.value"
        :error-messages="errors.value"
        :menu-props="{auto: true, lazy: true}"
        @change="change('value', ...arguments)"
      />
    </div>
  </div>
</template>

<script>
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

	export default {
    mixins: [propertyFormMixin],
		data(){return {
			damageTypes: [
        {
					value: 'bludgeoning',
					text: 'Bludgeoning',
				}, {
					value: 'piercing',
					text: 'Piercing',
				}, {
					value: 'slashing',
					text: 'Slashing',
				}, {
					value: 'acid',
					text: 'Acid',
				}, {
					value: 'cold',
					text: 'Cold',
				}, {
					value: 'fire',
					text: 'Fire',
				}, {
					value: 'force',
					text: 'Force',
				}, {
					value: 'lightning',
					text: 'Lightning',
				}, {
					value: 'necrotic',
					text: 'Necrotic',
				}, {
					value: 'poison',
					text: 'Poison',
				}, {
					value: 'psychic',
					text: 'Psychic',
				}, {
					value: 'radiant',
					text: 'Radiant',
				}, {
					value: 'thunder',
					text: 'Thunder',
				},
			],
			values: [
        {
					value: 0,
					text: 'Immunity',
				}, {
					value: 0.5,
					text: 'Resistance',
				}, {
					value: 2,
					text: 'Vulnerability',
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
