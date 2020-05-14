<template lang="html">
  <div class="attribute-form">
    <text-field
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      :debounce-time="debounceTime"
      @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
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
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['damageTypes'], value, ack})"
      />
      <smart-select
        label="Value"
        style="flex-basis: 300px;"
        :items="values"
        :value="model.value"
        :error-messages="errors.value"
        :menu-props="{auto: true, lazy: true}"
        :debounce-time="debounceTime"
        @change="(value, ack) => $emit('change', {path: ['value'], value, ack})"
      />
    </div>
  </div>
</template>

<script>
	export default {
		props: {
			model: {
				type: Object,
				default: () => ({}),
			},
			errors: {
				type: Object,
				default: () => ({}),
			},
      debounceTime: {
        type: Number,
        default: undefined,
      },
		},
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
