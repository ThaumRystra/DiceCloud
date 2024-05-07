<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        Action
      </v-toolbar-title>
    </template>
    <log-content :model="allLogContent" />
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
      v-if="actionDone"
      slot="actions"
      text
      @click="finishAction"
    >
      {{ 'Apply Results' }}
    </v-btn>
    <v-btn
      v-else
      slot="actions"
      text
      :disabled="actionBusy"
      @click="startAction"
    >
      {{ 'Start' }}
    </v-btn>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import EngineActions from '/imports/api/engine/action/EngineActions';
import applyAction from '/imports/api/engine/action/functions/applyAction';
import AdvantageInput from '/imports/client/ui/creature/actions/input/AdvantageInput.vue';
import CheckInput from '/imports/client/ui/creature/actions/input/CheckInput.vue';
import RollInput from '/imports/client/ui/creature/actions/input/RollInput.vue';
import getDeterministicDiceRoller from '/imports/api/engine/action/functions/userInput/getDeterministicDiceRoller';
import LogContent from '/imports/client/ui/log/LogContent.vue';

export default {
  components: {
    DialogBase,
    AdvantageInput,
    CheckInput,
    RollInput,
    LogContent,
  },
  props: {
    actionId: {
      type: String,
      default: undefined,
    },
    task: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      loading: false,
      actionBusy: false,
      actionDone: false,
      actionResult: undefined,
      resumeActionFn: undefined,
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
    },
    allLogContent() {
      const action = this.actionResult;
      const contents = [];
      action?.results?.forEach(result => {
        result.mutations?.forEach(mutation => {
          mutation.contents?.forEach(logContent => {
            contents.push(logContent);
          });
        });
      });
      return contents;
    },
  },
  meteor: {
    action() {
      return EngineActions.findOne(this.actionId);
    },
  },
  mounted() {
    this.deterministicDiceRoller = getDeterministicDiceRoller(this.actionId);
    this.startAction({ stepThrough: false });
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
        this.actionResult, this, { simulate: true, stepThrough, task: this.task}
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
    finishAction() {
      this.$store.dispatch('popDialogStack', this.actionResult);
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
    async rollDice(dice) {
      this.activeInputParams = {
        deterministicDiceRoller: this.deterministicDiceRoller,
        dice
      };
      this.activeInput = 'roll-input';
      return this.promiseInput();
    },
    async nextStep(task) {
      return this.promiseInput();
    },
    async choose(choices, quantity) {
      return this.promiseInput();
    },
    async advantage(suggestedAdvantage) {
      this.userInput = suggestedAdvantage;
      this.activeInput = 'advantage-input';
      this.userInputReady = true;
      return this.promiseInput();
    },
    async check(suggestedParams) {
      this.userInput = suggestedParams;
      this.activeInput = 'check-input';
      return this.promiseInput();
    },
  }
};
</script>
