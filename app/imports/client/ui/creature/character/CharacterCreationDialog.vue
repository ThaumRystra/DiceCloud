<template>
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        New Character
      </v-toolbar-title>
    </template>
    <template #unwrapped-content>
      <v-stepper
        v-model="step"
        flat
        non-linear
      >
        <v-stepper-header>
          <v-stepper-step
            editable
            :complete="step > 1"
            step="1"
            :rules="[() => biographyAlert || true]"
          >
            Biography
            <small v-if="biographyAlert">{{ biographyAlert }}</small>
          </v-stepper-step>
          <v-divider />
          <v-stepper-step
            editable
            :complete="step > 2"
            step="2"
          >
            Libraries
          </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-text-field
              v-model="name"
              variant="outlined"
              label="Name"
              class="mt-1"
              :error="!name"
            />
            <v-text-field
              v-model="alignment"
              variant="outlined"
              label="Alignment"
            />
            <v-text-field
              v-model="gender"
              variant="outlined"
              label="Gender"
            />
            <v-text-field
              v-model.number="startingLevel"
              variant="outlined"
              label="Level"
              type="number"
              height="20"
              min="0"
              @keydown.tab="step++"
            />
          </v-stepper-content>
          <v-stepper-content step="2">
            <v-switch
              v-model="allSubscribedLibraries"
              label="All user libraries"
            />
            <library-list
              selection
              :disabled="allSubscribedLibraries"
              :libraries-selected="librariesSelected"
              :library-collections-selected="libraryCollectionsSelected"
              :libraries-selected-by-collections="librariesSelectedByCollections"
              @select-library="selectLibrary"
              @select-library-collection="selectLibraryCollection"
            />
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </template>
    <template #actions>
      <v-btn
        variant="text"
        @click="$emit('pop')"
      >
        Cancel
      </v-btn>
      <v-btn
        v-if="step > 1"
        variant="text"
        @click="step--"
      >
        Back
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="step < 2"
        color="accent"
        @click="step++"
      >
        Next
      </v-btn>
      <v-btn
        :disabled="!!biographyAlert"
        :text="step < 2"
        :color="step < 2 ? '' : 'accent'"
        @click="submit"
      >
        Create
      </v-btn>
    </template>
  </dialog-base>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { autorun, subscribe } from 'vue-meteor-tracker';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { defer, union, without } from 'lodash';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import insertCreature from '/imports/api/creature/creatures/methods/insertCreature';
import LibraryList from '/imports/client/ui/library/LibraryList.vue';
import LibraryCollections from '/imports/api/library/LibraryCollections';
import { key } from '/imports/client/ui/vuexStore';

const emit = defineEmits(['pop']);
const store = useStore(key);
const router = useRouter();

autorun(() => {
  subscribe('libraries');
});

const step = ref(1);
const name = ref('New Character');
const gender = ref('');
const alignment = ref('');
const startingLevel = ref(1);
const librariesSelected = ref<string[]>([]);
const libraryCollectionsSelected = ref<string[]>([]);
const librariesSelectedByCollections = ref<string[]>([]);
const allSubscribedLibraries = ref(true);

const biographyAlert = computed(() => {
  if (!name.value) return 'Name required';
  return undefined;
});

function selectLibrary(libraryId: string, val: boolean) {
  if (val) {
    librariesSelected.value = union(librariesSelected.value, [libraryId]);
  } else {
    librariesSelected.value = without(librariesSelected.value, libraryId);
  }
}

function selectLibraryCollection(libraryCollectionId: string, val: boolean) {
  const collection = LibraryCollections.findOne(libraryCollectionId);
  if (!collection) return;
  if (val) {
    libraryCollectionsSelected.value = union(libraryCollectionsSelected.value, [libraryCollectionId]);
    librariesSelectedByCollections.value = union(librariesSelectedByCollections.value, collection.libraries);
  } else {
    libraryCollectionsSelected.value = without(libraryCollectionsSelected.value, libraryCollectionId);
    librariesSelectedByCollections.value = without(librariesSelectedByCollections.value, ...collection.libraries);
  }
}

async function submit() {
  const char: any = {
    name: name.value,
    gender: gender.value,
    alignment: alignment.value,
    startingLevel: startingLevel.value,
  };
  if (!allSubscribedLibraries.value) {
    char.allowedLibraries = librariesSelected.value;
    char.allowedLibraryCollections = libraryCollectionsSelected.value;
  }
  try {
    const creatureId = await insertCreature.callAsync(char);
    store.commit('setTabForCharacterSheet', { id: creatureId, tab: 'build' });
    emit('pop', creatureId);
    defer(() => {
      router.push({ name: 'characterSheet', params: { id: creatureId } });
    });
    return creatureId;
  } catch (error: any) {
    console.error(error);
    snackbar({ text: error.reason });
  }
}
</script>

<style scoped>
.point-buy-table {
  width: 100%;
}

.point-buy-table td {
  text-align: center;
  padding: 0 8px 0 8px;
  max-width: 50px;
}
</style>
