<template lang="html">
  <v-expansion-panels
    v-model="expand"
    accordion
    rounded="0"
    multiple
    hover
  >
    <slot />
  </v-expansion-panels>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import type { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import { key } from '/imports/client/ui/vuexStore';

const props = withDefaults(defineProps<{
  type?: CreatureProperty['type'];
}>(), {
  type: undefined,
});

const store = useStore(key);

const expand = ref(store.getters.formExpansionByType(props.type));

watch(expand, (value) => {
  if (!props.type) return;
  store.commit('setFormExpansion', { type: props.type, value });
});
</script>
