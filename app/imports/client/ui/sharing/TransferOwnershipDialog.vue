<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import { transferOwnership } from '/imports/api/sharing/sharing';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  docRef: object;
  user: object;
}>();

const store = useStore(key);
const error = ref<string | undefined>(undefined);

async function transfer() {
  try {
    await transferOwnership.callAsync({
      docRef: props.docRef,
      userId: (props.user as any)._id,
    });
    error.value = undefined;
    store.dispatch('popDialogStack');
  } catch (e: any) {
    error.value = e.reason || e.message || e.toString();
  }
}
</script>

<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        Transfer Ownership
      </v-toolbar-title>
    </template>
    <v-alert
      type="error"
      variant="outlined"
    >
      <template v-if="error">
        <p>
          {{ error }}
        </p>
      </template>
      <template v-else>
        <p>
          Are you sure you want to transfer ownership to {{ user.username || user._id }}?
        </p>
        <p>
          This can only be undone by the user you are transferring ownership to.
        </p>
        <p>
          You will still have edit permission.
        </p>
      </template>
    </v-alert>
    <div class="d-flex justify-center">
      <v-btn
        color="accent"
        @click="transfer"
      >
        Transfer
        <template v-if="user.username">
          to {{ user.username }}
        </template>
      </v-btn>
    </div>
  </dialog-base>
</template>

<style lang="css" scoped></style>
