<template lang="html">
  <v-list-tile
    class="ability-list-tile"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-tile-content>
      <computed signed :value="model.rollBonus"/>
      {{ model.name }}
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
import ComputedForCreature from '/imports/ui/components/computation/ComputedForCreature.vue';

export default {
  components: {
    Computed: ComputedForCreature,
  },
  props: {
    model: {
      type: Object,
      required: true,
    }
  },
  computed: {
		hasClickListener(){
      return this.$listeners && this.$listeners.click
		},
	},
  methods: {
    click(e){
			this.$emit('click', e);
		},
  }
}
</script>

<style lang="css" scoped>
</style>
