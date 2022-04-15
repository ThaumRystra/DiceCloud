<template lang="html">
  <v-card
    style="height: 150px; min-width: 120px;"
    :color="active ? 'primary' : ''"
    hover
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @click="$emit('click')"
  >
    <v-img
      :src="model.picture"
      aspect-ratio="1"
      position="top center"
    />
    <div
      class="small-title"
    >
      {{ model.name }}
    </div>
    <card-highlight :active="hover" />
  </v-card>
</template>

<script lang="js">
import CardHighlight from '/imports/ui/components/CardHighlight.vue';
export default {
  components: {
    CardHighlight,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    active: Boolean,
  },
  data(){return {
    hover: false,
  }},
}
</script>

<style lang="css" scoped>
.small-title {
  font-size: 14px;
  padding: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
