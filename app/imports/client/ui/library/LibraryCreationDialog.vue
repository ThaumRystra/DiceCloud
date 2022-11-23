<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        New Library
      </v-toolbar-title>
    </template>
    <text-field
      label="Name"
      :value="library.name"
      :debounce-time="0"
      @change="nameChanged"
    />
    <text-area
      label="Description"
      :value="library.description"
      :debounce-time="0"
      @change="descriptionChanged"
    />
    <template slot="actions">
      <v-spacer />
      <v-btn
        text
        :disabled="!valid"
        @click="$store.dispatch('popDialogStack', library)"
      >
        Insert Library
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';

export default {
  components: {
    DialogBase,
  },
  data() {
    return {
      library: {
        name: 'New Library',
        description: undefined,
      },
      valid: true,
    }
  },
  methods: {
    nameChanged(val, ack) {
      if (val) {
        this.library.name = val;
        this.valid = true,
          ack();
      } else {
        this.valid = false;
        ack('Name is required')
      }
    },
    descriptionChanged(val, ack) {
      this.library.description = val;
      ack();
    },
  },
};
</script>

<style lang="css" scoped>

</style>
