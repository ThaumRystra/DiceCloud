<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        Action
      </v-toolbar-title>
    </template>
    <div>
      content
    </div>
    <v-btn
      slot="actions"
      text
      @click="cancel"
    >
      Cancel
    </v-btn>
    <v-spacer slot="actions" />
    <v-btn
      slot="actions"
      text
      @click="apply(true)"
    >
      Step
    </v-btn>
    <v-btn
      slot="actions"
      text
      @click="apply()"
    >
      Apply all
    </v-btn>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import doAction from '/imports/api/engine/actions/doAction';
import { provideUserInput } from '/imports/api/engine/actions/getUserInput.js';

export default {
  components: {
    DialogBase,
  },
  props: {
    propId: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      invocationId: undefined,
      answers: {},
      loading: false,
    }
  },
  meteor: { 
    
  },
  methods: {
    apply(step = false) {
      if (this.invocationId) {
        provideUserInput(this.invocationId, 0, { index: 1 });
      } else {
        this.invocationId = Random.id();
        doAction.call({
          invocationId: this.invocationId,
          actionId: this.propId,
          targetIds: [],
        });
      }
    },
    cancel() {
      this.$store.dispatch('popDialogStack');
    },
  }
};
</script>
