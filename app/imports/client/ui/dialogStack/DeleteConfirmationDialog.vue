<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      Delete {{ typeName }}
    </v-toolbar-title>
    <div>
      <v-alert
        type="warning"
        outlined
      >
        This can't be undone
      </v-alert>
      <p v-if="name">
        Type "{{ name }}" to permanenetly delete.
      </p>
      <v-text-field
        v-if="name"
        v-model="inputName"
        label="Confirmation"
        outlined
      />
      <div class="layout justify-center">
        <v-btn
          v-show="nameMatch"
          class="primary"
          @click="$store.dispatch('popDialogStack', true);"
        >
          Delete forever
        </v-btn>
      </div>
    </div>
    <v-spacer slot="actions" />
    <v-btn
      slot="actions"
      text
      @click="$store.dispatch('popDialogStack')"
    >
      Cancel
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
