<template>
  <v-col
    cols="12"
    md="4"
    lg="3"
    class="d-flex flex-column justify-center align-center"
  >
    <v-progress-circular
      :rotate="-90"
      :size="100"
      :width="15"
      :value="percentFileStorageUsed"
      :buffer-value="50"
      color="accent"
    >
      {{ percentFileStorageUsed }}%
    </v-progress-circular>
    <div class="ma-2 mt-4">
      {{ prettyBytes(storageUsed) }} / {{ prettyBytes(storageAllowed) }}
      <v-btn
        icon
        @click="updateStorageUsed"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </div>
  </v-col>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import { getUserTier } from '/imports/api/users/patreon/tiers';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import updateFileStorageUsed from '/imports/api/users/methods/updateFileStorageUsed';
import prettyBytes from 'pretty-bytes';

const updateStorageUsedLoading = ref(false);

const { result: storageUsed } = autorun(() => Meteor.user()?.fileStorageUsed || 0);
const { result: storageAllowed } = autorun(() => getUserTier(Meteor.userId()).fileStorage * 1000000);

const percentFileStorageUsed = computed(() =>
  Math.round(((storageUsed.value ?? 0) / (storageAllowed.value ?? 1)) * 100)
);

async function updateStorageUsedFn() {
  updateStorageUsedLoading.value = true;
  try {
    await updateFileStorageUsed.callAsync();
  } catch (error: any) {
    snackbar({ text: error.reason });
  }
  updateStorageUsedLoading.value = false;
}
</script>

<style>

</style>
