<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { autorun } from 'vue-meteor-tracker';
import Creatures from '/imports/api/creature/creatures/Creatures';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import removeCreature from '/imports/api/creature/creatures/methods/removeCreature';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { key } from '/imports/client/ui/vuexStore';

const props = withDefaults(defineProps<{
  id?: string;
}>(), {
  id: undefined,
});

const store = useStore(key);
const router = useRouter();
const inputName = ref<string | undefined>(undefined);

const { result: name } = autorun(() => {
  const creature = Creatures.findOne(props.id, { fields: { name: 1 } });
  return creature && creature.name;
});

const nameMatch = computed(() => {
  if (!name.value) return true;
  const uppername = name.value.toUpperCase();
  const upperInputName = inputName.value && inputName.value.toUpperCase();
  return uppername === upperInputName;
});

async function remove() {
  router.push('/characterList');
  store.dispatch('popDialogStack');
  try {
    await removeCreature.callAsync({ charId: props.id });
  } catch (error: any) {
    console.error(error);
    snackbar({ text: error.message || error.toString() });
  }
}
</script>

<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        Delete Character
      </v-toolbar-title>
    </template>
    <div>
      <p v-if="name">
        Type "{{ name }}" to permanently delete the character
      </p>
      <v-text-field
        v-if="name"
        v-model="inputName"
      />
      <v-btn
        v-show="nameMatch"
        class="bg-primary"
        @click="remove"
      >
        Delete forever
      </v-btn>
    </div>
    <template #actions>
      <v-spacer />
      <v-btn
        variant="text"
        @click="$store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
    </template>
  </dialog-base>
</template>

<style lang="css" scoped></style>
