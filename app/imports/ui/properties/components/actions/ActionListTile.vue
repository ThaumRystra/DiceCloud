<template lang="html">
  <v-list-tile
    class="ability-list-tile"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-tile-content>
      <v-list-tile-title>
        {{ model.name }}
      </v-list-tile-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
export default {
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
