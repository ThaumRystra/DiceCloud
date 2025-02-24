<template>
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      {{ $t('CharacterCreationDialog.g9OEQ6ODxw3182cFY8mfD') }}
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
          {{ $t('CharacterCreationDialog.ANXfivoQBJ7vJA21ti7OF') }}
          <small v-if="biographyAlert">{{ biographyAlert }}</small>
        </v-stepper-step>
        <v-divider />
        <v-stepper-step
          editable
          :complete="step > 2"
          step="2"
        >
          {{ $t('CharacterCreationDialog.uiuDKE-JU_7xjNfrbo7lh') }}
        </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <v-text-field
            v-model="name"
            outlined
            :label="$t('TabletopForm.ogp8pUXHP7GwzGUlEkqSF')"
            class="mt-1"
            :error="!name"
          />
          <v-text-field
            v-model="alignment"
            outlined
            :label="$t('CreatureForm.goOLNBH2M1q5u3b9JGUYd')"
          />
          <v-text-field
            v-model="gender"
            outlined
            :label="$t('CreatureForm.5PEqzUXcmiqyy4GEbI-td')"
          />
          <v-text-field
            v-model.number="startingLevel"
            outlined
            :label="$t('CharacterCreationDialog.ALoCn8fXt0dv34QiFx1jx')"
            type="number"
            height="20"
            min="0"
            @keydown.tab="step++"
          />
        </v-stepper-content>
        <v-stepper-content step="2">
          <v-switch
            v-model="allSubscribedLibraries"
            :label="$t('CreatureForm.hQuConId3Ue_R35EPFuP-')"
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
        {{ $t('DeleteConfirmationDialog.7_oqaObBgI5fk_suDAZ0V') }}
      </v-btn>
      <v-btn
        v-if="step > 1"
        text
        @click="step--"
      >
        {{ $t('CharacterCreationDialog.C5B9zZf15rhmo_2vfaQtc') }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="step < 2"
        color="accent"
        @click="step++"
      >
        {{ $t('CharacterCreationDialog.WND9g9jyBvyLplbYycyfB') }}
      </v-btn>
      <v-btn
        :disabled="!!biographyAlert"
        :text="step < 2"
        :color="step < 2? '' : 'accent'"
        @click="submit"
      >
        {{ $t('CharacterCreationDialog.EGyaTsNsK_I2KkiUB2hjV') }}
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
    name: this.$t('CharacterCreationDialog.h1v791IkWNs4KC1w7m6Yy'),
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
      if (!this.name) return this.$t('CharacterCreationDialog.JpT06KJNwEyJ4AD2XbbM_');
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
