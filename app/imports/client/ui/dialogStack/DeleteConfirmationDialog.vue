<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import { key } from '/imports/client/ui/vuexStore';

const store = useStore(key);

const props = defineProps<{
  typeName?: string;
  name?: string;
}>();

const inputName = ref<string | undefined>(undefined);

const nameMatch = computed(() => {
  if (!props.name) return true;
  const uppername = props.name.toUpperCase();
  const upperInputName = inputName.value?.toUpperCase();
  return uppername === upperInputName;
});
</script>

<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        Delete {{ typeName }}
      </v-toolbar-title>
    </template>
    <div>
      <v-alert
        type="warning"
        variant="outlined"
      >
        This can't be undone
      </v-alert>
      <p v-if="name">
        Type "{{ name }}" to permanenetly delete.
      </p>
      <v-text-field
        v-if="name"
        v-model="inputName"
        label="Confirmation"
        variant="outlined"
      />
      <div class="d-flex justify-center">
        <v-btn
          v-show="nameMatch"
          class="bg-primary"
          @click="store.dispatch('popDialogStack', true)"
        >
          Delete forever
        </v-btn>
      </div>
    </div>
    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        @click="store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
    </template>
  </dialog-base>
</template>

<style lang="css" scoped></style>
