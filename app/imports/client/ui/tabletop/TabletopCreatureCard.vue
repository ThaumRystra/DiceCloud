<template lang="html">
  <v-card
    style="height: 100px; width: 70px;"
    class="tabletop-creature-card"
    :color="active ? 'accent' : ''"
    hover
    :elevation="active ? 8 : 2"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @click="$emit('click')"
  >
    <v-progress-linear
      v-if="variables.hitPoints"
      :value="variables.hitPoints.value * 100 / variables.hitPoints.total"
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
    <div class="d-flex justify-center">
      <v-btn
        v-if="showTargetBtn"
        :color="targeted ? 'accent' : ''"
        :elevation="targeted ? 8 : 2"
        fab
        small
        @click.stop="targeted ? $emit('untarget') : $emit('target')"
      >
        <v-icon>{{ targeted ? 'mdi-target' : 'mdi-target' }}</v-icon>
      </v-btn>
    </div>
  </v-card>
</template>

<script lang="js">
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables.js';
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
    showTargetBtn: Boolean,
  },
  data(){return {
    hover: false,
  }
  },
  // @ts-ignore
  meteor: {
    variables() {
      return CreatureVariables.findOne({ _creatureId: this.model._id }) || {};
    }
  }
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

<style lang="css">
.tabletop-creature-card .v-btn {
  transition: all .3s ease;
}
</style>
