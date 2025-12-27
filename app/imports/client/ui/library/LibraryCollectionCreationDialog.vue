<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        {{ $t('pages.library.newCollection') }}
      </v-toolbar-title>
    </template>
    <template>
      <text-field
        :label="$t('pages.library.name')"
        :value="libraryCollection.name"
        :debounce-time="0"
        @change="nameChanged"
      />
      <text-area
        :label="$t('pages.library.description')"
        :value="libraryCollection.description"
        :debounce-time="0"
        @change="descriptionChanged"
      />
      <smart-select
        :label="$t('pages.library.libraries')"
        :items="libraryOptions"
        :value="libraryCollection.libraries"
        :debounce-time="0"
        multiple
        chips
        deletable-chips
        :no-data-text="$t('pages.library.noLibrariesFound')"
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
        {{ $t('pages.library.insertCollection') }}
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
      name: 'New Collection',
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
        ack(this.$t('pages.library.nameIsRequired'))
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
