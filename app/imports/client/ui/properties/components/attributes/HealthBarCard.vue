<template lang="html">
  <v-card class="pa-2">
    <health-bar
      v-for="attribute in attributes"
      :key="attribute._id"
      :model="attribute"
      @change="e => $emit('change', {_id: attribute._id, change: e})"
      @click="e => $emit('click', {_id: attribute._id})"
    />
  </v-card>
</template>

<script lang="js">
import HealthBar from '/imports/client/ui/properties/components/attributes/HealthBar.vue';

export default {
  components: {
    HealthBar,
  },
  props: {
    attributes: {
      type: Array,
      required: true
    },
  },
}
</script>
