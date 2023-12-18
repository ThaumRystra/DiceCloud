<template>
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      New Character
    </v-toolbar-title>
    <v-stepper
      slot="unwrapped-content"
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
            outlined
            label="Name"
            class="mt-1"
            :error="!name"
          />
          <v-text-field
            v-model="alignment"
            outlined
            label="Alignment"
          />
          <v-text-field
            v-model="gender"
            outlined
            label="Gender"
          />
          <v-text-field
            v-model.number="startingLevel"
            outlined
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
    <template slot="actions">
      <v-btn
        text
        @click="$emit('pop')"
      >
        Cancel
      </v-btn>
      <v-btn
        v-if="step > 1"
        text
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
        :color="step < 2? '' : 'accent'"
        @click="submit"
      >
        Create
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import { defer, union, without } from 'lodash';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import insertCreature from '/imports/api/creature/creatures/methods/insertCreature';
import LibraryList from '/imports/client/ui/library/LibraryList.vue';
import LibraryCollections from '/imports/api/library/LibraryCollections';

export default {
  components: {
    DialogBase,
    LibraryList,
  },
  data(){return {
    step: 1,
    name: 'New Character',
    gender: '',
    alignment: '',
    startingLevel: 1,
    librariesSelected: [],
    libraryCollectionsSelected: [],
    librariesSelectedByCollections: [],
    allSubscribedLibraries: true,
  }},
  computed: {
    biographyAlert() {
      if (!this.name) return 'Name required';
      return undefined;
    }
  },
  meteor: {
    $subscribe: {
      'libraries': [],
    },
  },
  methods: {
    selectLibrary(libraryId, val) {
      if (val) {
        this.librariesSelected = union(this.librariesSelected, [libraryId]);
      } else {
        this.librariesSelected = without(this.librariesSelected, libraryId);
      }
    },
    selectLibraryCollection(libraryCollectionId, val) {
      const collection = LibraryCollections.findOne(libraryCollectionId);
      if (!collection) return;
      if (val) {
        this.libraryCollectionsSelected = union(
          this.libraryCollectionsSelected,
          [libraryCollectionId]
        );
        this.librariesSelectedByCollections = union(
          this.librariesSelectedByCollections,
          collection.libraries
        );
      } else {
        this.libraryCollectionsSelected = without(
          this.libraryCollectionsSelected,
          libraryCollectionId,
        );
        this.librariesSelectedByCollections = without(
          this.librariesSelectedByCollections,
          ...collection.libraries
        );
      }
    },
    submit(){
      let char = {
        name: this.name,
        gender: this.gender,
        alignment: this.alignment,
        startingLevel: this.startingLevel,
      };
      if (!this.allSubscribedLibraries) {
        char.allowedLibraries = this.librariesSelected;
        char.allowedLibraryCollections = this.libraryCollectionsSelected;
      }
      insertCreature.call(char, (error, creatureId) => {
        if (error){
          console.error(error);
          snackbar({
            text: error.reason,
          });
        } else {
          this.$store.commit(
              'setTabForCharacterSheet',
              {id: creatureId, tab: 'build'}
            );
          this.$emit('pop', creatureId);
          defer(() => {
            this.$router.push({ name: 'characterSheet', params: {id: creatureId} });
          });
          return creatureId;
        }
      });
    },
  }
};
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
