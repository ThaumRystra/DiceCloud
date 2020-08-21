<template lang="html">
  <v-card class="pa-2">
    <health-bar
      v-for="attribute in attributes"
      :key="attribute._id"
      :value="attribute.currentValue"
      :max-value="attribute.value"
      :name="attribute.name"
      :_id="attribute._id"
      @change="e => $emit('change', {_id: attribute._id, change: e})"
      @click="e => $emit('click', {_id: attribute._id})"
    />
    <div class="ma-3">
      <span
        v-if="multipliers.vulnerabilities.length"
        :class="{'mr-2': multipliers.resistances.length || multipliers.immunities.length}"
      >
        <b>Vulnerability:</b> {{ multipliers.vulnerabilities.join(', ') }}
      </span>
      <span
        v-if="multipliers.resistances.length"
        :class="{'mr-2': multipliers.immunities.length}"
      >
        <b>Resistance:</b> {{ multipliers.resistances.join(', ') }}
      </span>
      <span
        v-if="multipliers.immunities.length"
      >
        <b>Immunity:</b> {{ multipliers.immunities.join(', ') }}
      </span>
    </div>
  </v-card>
</template>

<script>
	import HealthBar from '/imports/ui/properties/components/attributes/HealthBar.vue';

	export default {
    inject: {
      context: { default: {} }
    },
		components: {
			HealthBar,
		},
		props: {
			attributes: {
        type: Array,
        required: true
       },
		},
    computed: {
      multipliers() {
        let damageMultipliers = this.context.creature.damageMultipliers;
        let vulnerabilities = [];
        let resistances = [];
        let immunities = [];
        for (let key in damageMultipliers){
          switch(damageMultipliers[key]){
            case 2: vulnerabilities.push(key); break;
            case 0.5: resistances.push(key); break;
            case 0: immunities.push(key); break;
          }
        }
        return {vulnerabilities, resistances, immunities};
      }
    },
	}
</script>
