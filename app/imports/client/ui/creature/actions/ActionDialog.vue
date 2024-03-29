<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        Action
      </v-toolbar-title>
    </template>
    <!--
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
    -->
    <component
      :is="activeInput"
      v-if="activeInput"
      v-model="userInput"
      v-bind="activeInputParams"
      @continue="continueAction"
      @set-input-ready="setInputReady"
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
      v-show="!actionDone"
      slot="actions"
      text
      :disabled="!userInputReady || !resumeActionFn"
      @click="stepAction"
    >
      Step
    </v-btn>
    <v-btn
      slot="actions"
      text
      :disabled="actionBusy && !actionDone"
      @click="startAction"
    >
      {{ actionDone ? 'Apply Results' : 'Start' }}
    </v-btn>
  </dialog-base>
</template>

<script lang="ts">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import EngineActions from '/imports/api/engine/action/EngineActions';
import applyAction from '/imports/api/engine/action/functions/applyAction';
import AdvantageInput from '/imports/client/ui/creature/actions/input/AdvantageInput.vue';

export default {
  components: {
    DialogBase,
    AdvantageInput,
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
      actionBusy: false,
      actionDone: false,
      actionResult: undefined,
      resumeActionFn: () => this.startAction({ stepThrough: true }),
      activeInput: undefined,
      activeInputParams: {},
      userInput: undefined,
      userInputReady: true,
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
  meteor: {
    action() {
      return EngineActions.findOne(this.actionId);
    },
  },
  methods: {
    startAction({ stepThrough }) {
      this.actionBusy = true;
      this.actionResult = {
        ...this.action,
        _stepThrough: undefined,
        _isSimulation: undefined, 
        taskCount: undefined,
      };
      applyAction(
        this.actionResult, this, { simulate: true, stepThrough }
      ).then(() => {
        this.actionDone = true
      });
    },
    stepAction() {
      if (this.actionResult) {
        this.actionResult._stepThrough = true;
      }
      this.resumeActionFn?.();
    },
    continueAction() {
      if (this.actionResult) {
        this.actionResult._stepThrough = false;
      }
      this.resumeActionFn?.();
    },
    promiseInput() {
      return new Promise(resolve => {
        this.resumeActionFn = () => {
          this.resumeActionFn = undefined;
          const savedInput = this.userInput;
          this.userInput = undefined;
          this.activeInput = undefined;
          this.activeInputParams = {};
          this.userInputReady = false;
          resolve(savedInput);
        }
      });
    },
    setInputReady(val) {
      this.userInputReady = val;
    },
    cancel() {
      this.$store.dispatch('popDialogStack');
    },
    // inputProvider methods
    async rollDice(diceArray) {
      console.log({diceArray});
      return this.promiseInput();
    },
    async nextStep(task) {
      console.log({task});
      return this.promiseInput();
    },
    async choose(choices, quantity) {
      console.log({choices, quantity});
      return this.promiseInput();
    },
    async advantage(suggestedAdvantage) {
      this.userInput = suggestedAdvantage;
      this.activeInput = 'advantage-input';
      this.userInputReady = true;
      return this.promiseInput();
    },
    async check(suggestedParams) {
      console.log({ suggestedParams })
      return this.promiseInput();
    },
  }
};
</script>
