<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import updateCreatureFolderName from '/imports/api/creature/creatureFolders/methods/updateCreatureFolderName';
import removeCreatureFolder from '/imports/api/creature/creatureFolders/methods/removeCreatureFolder';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';

const props = defineProps<{
  model: Record<string, any>;
  open?: boolean;
  selection?: boolean;
  dense?: boolean;
}>();

const nameInput = ref<any>(null);
const renaming = ref(false);
const newName = ref(props.model?.name);

watch(renaming, async (value) => {
  if (value) {
    await nextTick();
    nameInput.value?.focus();
  } else if (newName.value && newName.value !== props.model.name) {
    try {
      await updateCreatureFolderName.callAsync({
        _id: props.model._id,
        name: newName.value,
      });
    } catch (error: any) {
      console.error(error);
      snackbar({ text: error.reason });
    }
  }
});

function renameFolder(name: string, ack: () => void) {
  newName.value = name;
  ack();
}

async function removeFolder() {
  try {
    await removeCreatureFolder.callAsync({ _id: props.model._id });
  } catch (error: any) {
    console.error(error);
    snackbar({ text: error.reason });
  }
}
</script>

<template lang="html">
  <div
    :style="{ minHeight: dense? '': '32px' }"
    class="d-flex align-center flex-grow-1"
  >
    <div
      v-if="!renaming"
      class="text-truncate text-no-wrap"
    >
      {{ model.name }}
    </div>
    <text-field
      v-if="renaming"
      ref="name-input"
      regular
      hide-details
      density="compact"
      :value="newName"
      @change="renameFolder"
      @click.stop=""
      @input.stop=""
      @keydown.stop=""
      @keyup.stop=""
    />
    <template v-if="!selection && !dense">
      <v-spacer />
      <v-btn
        v-if="renaming || open"
        :icon="renaming ? 'mdi-check' : 'mdi-pencil'"
        variant="plain"
        density="compact"
        @click.stop="renaming = !renaming"
      />
      <v-btn
        v-if="open"
        icon="mdi-delete"
        variant="plain"
        density="compact"
        @click.stop="removeFolder"
      />
    </template>
  </div>
</template>

<style lang="css" scoped>
</style>
