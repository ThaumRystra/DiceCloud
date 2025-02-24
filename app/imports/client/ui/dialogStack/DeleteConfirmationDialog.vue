<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      {{ $t('DeleteConfirmationDialog.NqZTumeNzQNE0i-F6-wQq', [typeName]) }}
    </v-toolbar-title>
    <div>
      <v-alert
        type="warning"
        outlined
      >
        {{ $t('DeleteConfirmationDialog.lh_KKI_3wtSGXNz8pxZtG') }}
      </v-alert>
      <p v-if="name">
        {{ $t('DeleteConfirmationDialog._95JuuAuQDlmbx8hH1rhy', [name]) }}
      </p>
      <v-text-field
        v-if="name"
        v-model="inputName"
        :label="$t('DeleteConfirmationDialog.qemK_cDjoxeMkRtXI05V_')"
        outlined
      />
      <div class="layout justify-center">
        <v-btn
          v-show="nameMatch"
          class="primary"
          @click="$store.dispatch('popDialogStack', true);"
        >
          {{ $t('DeleteConfirmationDialog.vQ64nw8OemMSa9GxOCc8n') }}
        </v-btn>
      </div>
    </div>
    <v-spacer slot="actions" />
    <v-btn
      slot="actions"
      text
      @click="$store.dispatch('popDialogStack')"
    >
      {{ $t('DeleteConfirmationDialog.7_oqaObBgI5fk_suDAZ0V') }}
    </v-btn>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';

export default {
  components: {
    DialogBase,
  },
  props: {
    typeName: {
      type: String,
      default: undefined,
    },
    name: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      inputName: undefined,
    }
  },
  computed: {
    nameMatch() {
      if (!this.name) return true;
      let uppername = this.name.toUpperCase();
      let upperInputName = this.inputName && this.inputName.toUpperCase();
      return uppername === upperInputName;
    },
  },
};
</script>

<style lang="css" scoped>

</style>
