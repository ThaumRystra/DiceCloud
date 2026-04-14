<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  creature: Record<string, any>;
}>();

const store = useStore(key);
const hover = ref(false);

function showCharacterForm() {
  store.commit('pushDialogStack', {
    component: 'creature-form-dialog',
    elementId: 'creature-summary',
    data: { _id: props.creature._id },
  });
}
</script>

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

<style></style>
