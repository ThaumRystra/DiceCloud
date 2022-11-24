<template lang="html">
  <v-card
    style="height: 100px; width: 70px;"
    :color="active ? 'accent' : ''"
    hover
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @click="$emit('click')"
  >
    <v-progress-linear
      v-if="model.variables.hitPoints"
      :value="model.variables.hitPoints.value * 100 / model.variables.hitPoints.total"
    />
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
    <v-btn
      :color="targeted ? 'accent' : ''"
      fab
      small
      style="position: fixed;"
      @click.stop="targeted ? $emit('untarget') : $emit('target')"
    >
      <v-icon>{{ targeted ? 'mdi-target' : 'mdi-target' }}</v-icon>
    </v-btn>
  </v-card>
</template>

<script lang="js">
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';
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
    targeted: Boolean,
  },
  data(){return {
    hover: false,
  }},
}
</script>

<style lang="css" scoped>
.small-title {
  font-size: 12px;
  padding: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
