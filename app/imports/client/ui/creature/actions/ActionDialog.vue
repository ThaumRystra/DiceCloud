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
    <tree-node-view
      v-for="prop in taskProps"
      :key="prop._id"
      :model="prop"
    />
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
//import Actions, { runAction } from '/imports/api/engine/actions/ActionEngine';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';

export default {
  components: {
    DialogBase,
    TreeNodeView,
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
    taskProps() { 
      if (!this.action) return;
      return this.action.taskQueue.map(task => {
        return CreatureProperties.findOne(task.propId);
      });
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
