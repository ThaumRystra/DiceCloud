<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        {{ $t('LibraryCreationDialog.hu7zV_QaHHXsA5Fe4wjy7') }}
      </v-toolbar-title>
    </template>
    <text-field
      :label="$t('TabletopForm.ogp8pUXHP7GwzGUlEkqSF')"
      :value="library.name"
      :debounce-time="0"
      @change="nameChanged"
    />
    <text-area
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
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
        {{ $t('LibraryCreationDialog.08g2uPx0s44itGzjyflWz') }}
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
        name: this.$t('LibraryCreationDialog.IZrKqkZHdXwybtwrBlqxF'),
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
        ack(this.$t('Register.yfTv252rVq9SqVdTJ3Yks'))
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
