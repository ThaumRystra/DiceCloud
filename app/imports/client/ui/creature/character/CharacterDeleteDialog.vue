<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      {{ $t('CharacterDeleteDialog.cz32NY5-KS9_JgprY2IwT') }}
    </v-toolbar-title>
    <div>
      <p v-if="name">
        {{ $t('CharacterDeleteDialog.qJSNB7_gDzHxyoaC_JSzu', [name]) }}
      </p>
      <v-text-field
        v-if="name"
        v-model="inputName"
      />
      <v-btn
        v-show="nameMatch"
        class="primary"
        @click="remove"
      >
        {{ $t('DeleteConfirmationDialog.vQ64nw8OemMSa9GxOCc8n') }}
      </v-btn>
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
import Creatures from '/imports/api/creature/creatures/Creatures';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import removeCreature from '/imports/api/creature/creatures/methods/removeCreature';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';

export default {
  components: {
    DialogBase,
  },
  props: {
    id: String,
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
  meteor: {
    name() {
      let creature = Creatures.findOne(this.id, { fields: { name: 1 } });
      return creature && creature.name;
    },
  },
  methods: {
    remove() {
      this.$router.push('/characterList');
      this.$store.dispatch('popDialogStack');
      removeCreature.call({ charId: this.id }, (error) => {
        if (error) {
          console.error(error);
          snackbar({ text: error.message || error.toString() });
        }
      });
    }
  }
};
</script>

<style lang="css" scoped>

</style>
