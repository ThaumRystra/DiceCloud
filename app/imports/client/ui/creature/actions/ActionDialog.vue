<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        Action
      </v-toolbar-title>
    </template>
    <pre>
      <code>
        {{ actionJson }}
      </code>
    </pre>
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
import Actions, { runAction } from '/imports/api/engine/actions/Actions';

export default {
  components: {
    DialogBase,
  },
  props: {
    actionId: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      loading: false,
    }
  },
  meteor: { 
    action() {
      return Actions.findOne(this.actionId);
    },
  },
  computed: {
    actionJson() {
      return JSON.stringify(this.action, null, 2);
    },
  },
  methods: {
    async apply(stepThrough) {
      await runAction.callAsync({
        actionId: this.actionId,
        stepThrough
      });
    },
    cancel() {
      this.$store.dispatch('popDialogStack');
    },
  }
};
</script>
