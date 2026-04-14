<script setup lang="ts">
import { ref, inject } from 'vue';
import { useStore } from 'vuex';
import doAction from '/imports/client/ui/creature/actions/doAction';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  type: string;
  creatureId: string;
}>();

const context = inject('context', {} as any);
const store = useStore(key);
const loading = ref(false);

async function rest() {
  loading.value = true;
  try {
    await doAction({
      creatureId: props.creatureId,
      $store: store,
      elementId: `rest-btn-${props.type}`,
      task: {
        subtaskFn: 'reset',
        targetIds: [props.creatureId],
        eventName: props.type,
      },
    });
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template lang="html">
  <v-btn
    :loading="loading"
    :disabled="context.editPermission === false"
    variant="outlined"
    :data-id="`rest-btn-${type}`"
    style="width: 160px;"
    :prepend-icon="type === 'shortRest' ? 'mdi-music-rest-quarter' : 'mdi-bed'"
    @click="rest"
  >
    {{ type === 'shortRest' ? 'Short Rest' : 'Long Rest' }}
  </v-btn>
</template>
