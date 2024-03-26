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
    <pre>
      <code>
        {{ resultJson }}
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
      :disabled="!ackNextStep"
      @click="step"
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
import EngineActions from '/imports/api/engine/action/EngineActions';
import applyAction from '/imports/api/engine/action/functions/applyAction';

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
      actionResult: undefined,
      ackNextStep: undefined,
    };
  },
  computed: {
    actionJson() {
      return JSON.stringify(this.action, null, 2);
    },
    resultJson() {
      return JSON.stringify(this.actionResult, null, 2);
    }
  },
  mounted() {
    const vueInstance = this;
    this.inputProvider = {
      ackNextStep: undefined,
      async nextStep() {
        return new Promise(resolve => {
          console.log('ackNexStep set')
          vueInstance.ackNextStep = () => {
            vueInstance.ackNextStep = undefined;
            resolve(undefined);
          }
        });
      },
      async advantage() {
        return 0;
      },
      async rollDice(dice) {
        const results = [];
        for (const die of dice) {
          const rolls = [];
          for (let i = 0; i < die.number; i++){
            rolls.push(1);
          }
          results.push(rolls);
        }
        return results;
      }
    }
  },
  meteor: {
    action() {
      return EngineActions.findOne(this.actionId);
    },
  },
  methods: {
    async apply() {
      this.actionResult = {
        ...this.action,
        _stepThrough: undefined,
        _isSimulation: undefined, 
        taskCount: undefined,
      };
      applyAction(
        this.actionResult, this.inputProvider, { simulate: true, stepThrough: true }
      )
    },
    step() {
      this.ackNextStep();
    },
    cancel() {
      this.$store.dispatch('popDialogStack');
    },
  }
};
</script>
