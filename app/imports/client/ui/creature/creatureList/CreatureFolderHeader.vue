<template lang="html">
  <div :style="dense ? undefined : 'min-height: 60px;'">
    <v-list-item-title class="d-flex align-center">
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
          icon
          style="flex-grow: 0"
          @click.stop="renaming = !renaming"
        >
          <v-icon v-if="renaming">
            mdi-check
          </v-icon>
          <v-icon v-else>
            mdi-pencil
          </v-icon>
        </v-btn>
        <v-btn
          v-if="open"
          icon
          style="flex-grow: 0"
          @click.stop="removeFolder"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-list-item-title>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import updateCreatureFolderName from '/imports/api/creature/creatureFolders/methods.js/updateCreatureFolderName';
import removeCreatureFolder from '/imports/api/creature/creatureFolders/methods.js/removeCreatureFolder';
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

<style lang="css" scoped>
</style>
