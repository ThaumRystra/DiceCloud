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
  </v-card>
</template>

<script>
	import HealthBar from '/imports/ui/properties/components/attributes/HealthBar.vue';

	export default {
		components: {
			HealthBar,
		},
		props: {
			attributes: Array,
		},
	}
</script>
