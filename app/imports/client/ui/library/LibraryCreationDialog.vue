<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        {{ $t('pages.library.newLibrary') }}
      </v-toolbar-title>
    </template>
    <text-field
      :label="$t('pages.library.name')"
      :value="library.name"
      :debounce-time="0"
      @change="nameChanged"
    />
    <text-area
      :label="$t('pages.library.description')"
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
        {{ $t('pages.library.insertLibrary') }}
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
        ack(this.$t('pages.library.nameIsRequired'))
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
