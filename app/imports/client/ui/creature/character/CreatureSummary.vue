<template>
  <v-card
    hover
    data-id="creature-summary"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @click="showCharacterForm"
  >
    <v-img
      v-if="creature.picture"
      :src="creature.picture"
    />
    <v-card-title class="text-h6">
      {{ creature.name }}
    </v-card-title>
    <v-card-text>
      {{ creature.alignment }}<br>
      {{ creature.gender }}
    </v-card-text>
    <card-highlight :active="hover" />
  </v-card>
</template>

<script lang="js">
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';

export default {
  components: {
    CardHighlight,
  },
  props: {
    creature: {
      type: Object,
      required: true,
    },
  },
  data(){ return {
    hover: false,
  }},
  methods: {
      showCharacterForm(){
        this.$store.commit('pushDialogStack', {
          component: 'creature-form-dialog',
          elementId: 'creature-summary',
          data: {
            _id: this.creature._id,
          },
        });
      },
  }
}
</script>

<style>

</style>