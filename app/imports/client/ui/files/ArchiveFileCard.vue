<template>
  <v-card :data-id="`${model._id}-archive-card`">
    <v-card-title>
      {{ model.meta.creatureName }}
    </v-card-title>
    <v-card-subtitle>
      {{ model.size }}
    </v-card-subtitle>
    <v-card-actions>
      <v-btn
        v-if="characterSlots > 0"
        variant="text"
        :loading="restoreLoading"
        @click="restore(model._id)"
      >
        Restore
      </v-btn>
      <div class="flex" />
      <v-btn
        icon
        @click="removeArchiveCharacter"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-btn
        icon
        :href="`${model.link}?download=true`"
      >
        <v-icon>mdi-download</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import restoreCreatureFromFile from '/imports/api/creature/archive/methods/restoreCreatureFromFile';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { characterSlotsRemainingAsync } from '/imports/api/creature/creatures/methods/assertHasCharacterSlots';
import removeArchiveCreature from '/imports/api/creature/archive/methods/removeArchiveCreature';

const props = defineProps<{
  model: any;
}>();

const store = useStore();
const restoreLoading = ref(false);
const removeLoading = ref(false);

const { result: characterSlots } = autorun(() => characterSlotsRemainingAsync(Meteor.userId()));

async function restore() {
  restoreLoading.value = true;
  try {
    await restoreCreatureFromFile.callAsync({ fileId: props.model._id });
  } catch (error: any) {
    console.error(error);
    snackbar({ text: error.reason });
  }
  restoreLoading.value = false;
}

function removeArchiveCharacter() {
  store.commit('pushDialogStack', {
    component: 'delete-confirmation-dialog',
    elementId: `${props.model._id}-archive-card`,
    data: {
      name: props.model.meta.creatureName,
      typeName: 'Character Archive',
    },
    async callback(confirmation: boolean) {
      if (!confirmation) return;
      try {
        await removeArchiveCreature.callAsync({ fileId: props.model._id });
      } catch (error) {
        console.error(error);
      }
    },
  });
}
</script>
