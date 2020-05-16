<template lang="html">
  <v-list-tile
    class="ability-list-tile"
    avatar
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-tile-avatar color="grey darken-1">
      <computed
        signed
        :value="model.rollBonus"
        class="white--text headline"
      />
    </v-list-tile-avatar>
    <v-list-tile-content>
      <v-list-tile-title>
        {{ model.name }}
      </v-list-tile-title>
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
