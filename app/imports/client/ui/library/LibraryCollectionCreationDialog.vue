<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        {{ $t('LibraryCollectionCreationDialog.91vPMCkyY7wba30jPsufP') }}
      </v-toolbar-title>
    </template>
    <template>
      <text-field
        :label="$t('TabletopForm.ogp8pUXHP7GwzGUlEkqSF')"
        :value="libraryCollection.name"
        :debounce-time="0"
        @change="nameChanged"
      />
      <text-area
        :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
        :value="libraryCollection.description"
        :debounce-time="0"
        @change="descriptionChanged"
      />
      <smart-select
        :label="$t('CharacterCreationDialog.uiuDKE-JU_7xjNfrbo7lh')"
        :items="libraryOptions"
        :value="libraryCollection.libraries"
        :debounce-time="0"
        multiple
        chips
        deletable-chips
        no-data-text="No libraries found"
        @change="librariesChanged"
      />
    </template>
    <template slot="actions">
      <v-spacer />
      <v-btn
        text
        :disabled="!valid"
        @click="$store.dispatch('popDialogStack', libraryCollection)"
      >
        {{ $t('LibraryCollectionCreationDialog.5XDN8RnSgbykb7y8Sl-U7') }}
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import Libraries from '/imports/api/library/Libraries';

export default {
  components: {
    DialogBase,
  },
  data(){ return {
    libraryCollection: {
      name: this.$t('LibraryCollectionCreationDialog.GbJh4HQgyhjYvVMuPW2on'),
      description: undefined,
      libraries: [],
    },
    valid: true,
  }},
  meteor: {
    libraryOptions() {
      const userId = Meteor.userId();
      return Libraries.find(
        {
          $or: [
            { owner: userId },
            { writers: userId },
            { readers: userId },
            { public: true },
          ]
        },
        {sort: {name: 1}}
      ).map(library => {
        return {
          text: library.name,
          value: library._id,
        };
      });
    }
  },
  methods: {
    nameChanged(val, ack){
      if (val){
        this.libraryCollection.name = val;
        this.valid = true,
        ack();
      } else {
        this.valid = false;
        ack(this.$t('Register.yfTv252rVq9SqVdTJ3Yks'))
      }
    },
    descriptionChanged(val, ack){
      this.libraryCollection.description = val;
      ack();
    },
    librariesChanged(val, ack){
      this.libraryCollection.libraries = val;
      ack();
    },
  },
};
</script>

<style lang="css" scoped>
</style>
