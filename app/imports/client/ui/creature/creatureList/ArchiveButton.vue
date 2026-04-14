<template lang="html">
  <v-btn
    :icon="!text"
    :text="text"
    :data-id="randomId"
    v-bind="$attrs"
    @click="openArchive"
  >
    <template v-if="text">
      Archive Characters
    </template>
    <v-icon :class="text ? 'ml-1' : ''">
      mdi-archive
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { Random } from 'meteor/random';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{ text?: boolean }>();
const store = useStore(key);
const randomId = ref(Random.id());

function openArchive() {
  store.commit('pushDialogStack', {
    component: 'archive-dialog',
    elementId: randomId.value,
  });
}
</script>

<style lang="css" scoped></style>
