<script setup lang="ts">
import { ref, inject } from 'vue';
import { useStore } from 'vuex';
import doAction from '/imports/client/ui/creature/actions/doAction';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  model: Record<string, any>;
}>();

const store = useStore(key);
const context = inject('context', {});

const hovering = ref(false);
const loading = ref(false);

async function doActionClick() {
  loading.value = true;
  try {
    await doAction({
      propId: props.model._id,
      creatureId: props.model.root.id,
      $store: store,
      elementId: `event-btn-${props.model._id}`,
      targetIds: [],
    });
  } catch (error: any) {
    snackbar({ text: error.reason || error.message || error.toString() });
    console.error(error);
  } finally {
    loading.value = false;
  }
}
</script>

<template lang="html">
  <v-btn
    :disabled="context.editPermission === false"
    :data-id="`event-btn-${model._id}`"
    variant="outlined"
    class="event-button"
    style="min-width: 160px; max-width: 100%;"
    :color="model.color"
    @click="doActionClick"
  >
    <property-icon
      style="margin-left: -4px; margin-right: 8px;"
      :model="model"
    />
    <div class="text-truncate">
      {{ model.name }}
    </div>
  </v-btn>
</template>

<style lang="css">
.event-button .v-btn__content {
  max-width: 100%;
}
</style>
