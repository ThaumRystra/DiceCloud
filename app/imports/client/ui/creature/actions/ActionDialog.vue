<template lang="html">
  <div class="overflow-visible">
    <v-slide-x-reverse-transition hide-on-leave>
      <v-card
        :key="`${activeInput}`"
        elevation="6"
        class="action-dialog"
      >
        <component
          :is="activeInput"
          v-if="activeInput"
          v-model="userInput"
          class="action-input"
          v-bind="activeInputParams"
          @continue="continueAction"
          @set-input-ready="setInputReady"
        />
        <div
          v-else
          class="log-preview card-raised-background"
        >
          <tabletop-log-stream-entry :model="simulatedLog" />
        </div>
        <v-btn
          v-if="!activeInput" 
          large
          text
          color="accent"
          style="width: 100%"
          class="done-button"
          @click="finishAction"
        >
          Done
        </v-btn>
      </v-card>
    </v-slide-x-reverse-transition>
  </div>
</template>

<script lang="js">
import applyAction from '/imports/api/engine/action/functions/applyAction';
import getDeterministicDiceRoller from '/imports/api/engine/action/functions/userInput/getDeterministicDiceRoller';

import AdvantageInput from '/imports/client/ui/creature/actions/input/AdvantageInput.vue';
import CheckInput from '/imports/client/ui/creature/actions/input/CheckInput.vue';
import ChoiceInput from '/imports/client/ui/creature/actions/input/ChoiceInput.vue';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import EngineActions from '/imports/api/engine/action/EngineActions';
import LogContent from '/imports/client/ui/log/LogContent.vue';
//import RollInput from '/imports/client/ui/creature/actions/input/RollInput.vue';
import TargetsInput from '/imports/client/ui/creature/actions/input/TargetsInput.vue';
import CastSpellInput from '/imports/client/ui/creature/actions/input/CastSpellInput.vue';
import { runAction } from '/imports/api/engine/action/methods/runAction';
import TabletopLogStreamEntry from '/imports/client/ui/tabletop/TabletopLogStreamEntry.vue';
import mutationToLogUpdates from '/imports/api/engine/action/functions/mutationToLogUpdates';

export default {
  components: {
    AdvantageInput,
    CheckInput,
    ChoiceInput,
    DialogBase,
    LogContent,
    //RollInput,
    TargetsInput,
    CastSpellInput,
    TabletopLogStreamEntry,
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
    actionFinishedCallback: {
      type: Function,
      default: undefined,
    }
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
      actionPromise: undefined,
    };
  },
  computed: {
    actionJson() {
      return JSON.stringify(this.action, null, 2);
    },
    resultJson() {
      return JSON.stringify(this.actionResult, null, 2);
    },
    simulatedLog() {
      const action = this.actionResult;
      const content = [];
      action?.results.forEach(result => {
        result.mutations.forEach(mutation => {
          content.push(...mutationToLogUpdates(mutation));
        });
      });
      return {
        content,
        creatureId: action?.creatureId,
        tabletopId: action?.tabletopId,
      }
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
    async startAction({ stepThrough }) {
      this.actionBusy = true;
      this.actionResult = {
        ...this.action,
        _stepThrough: undefined,
        _isSimulation: undefined, 
        taskCount: undefined,
      };
      await applyAction(this.actionResult, this, { simulate: true, stepThrough });
      const actionResult = await runAction.callAsync({
        actionId: this.actionResult._id,
        decisions: this.actionResult._decisions
      });
      this.actionDone = true;
      this.actionBusy = false;
      this.activeInput = undefined;
      if (this.actionFinishedCallback) this.actionFinishedCallback(actionResult);
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
    async finishAction() {
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
    async targetIds(target) {
      // Only get targets if we are on a tabletop
      if (this.$router.currentRoute.name !== 'tabletop') return [];
      this.userInput = [];
      this.activeInputParams = {
        target,
        tabletopId: this.action.tabletopId,
      };
      this.activeInput = 'targets-input'
      return this.promiseInput();
    },
    async rollDice(dice) {
      return Promise.resolve(this.deterministicDiceRoller(dice));
      /* Dice Animation and user control goes here:
      this.activeInputParams = {
        deterministicDiceRoller: this.deterministicDiceRoller,
        dice
      };
      this.activeInput = 'roll-input';
      return this.promiseInput();
      */
    },
    async nextStep(task) {
      return this.promiseInput();
    },
    async choose(choices, quantity) {
      this.userInput = [];
      this.activeInputParams = {
        choices,
        quantity
      };
      this.activeInput = 'choice-input'
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
    async castSpell(suggestedParams) {
      this.userInput = suggestedParams;
      this.activeInputParams = {
        creatureId: this.action.creatureId,
      };
      this.activeInput = 'cast-spell-input';
      return this.promiseInput();
    },
  }
};
</script>

<style lang="css" scoped>
.action-dialog {
  max-height: min(100vh, 800px);
  max-width: min(100vh, 1000px);
  min-width: 300px;
}

.action-input {
  overflow-y: auto;
}

.log-preview {
  overflow-y: auto;
  flex-basis: 300px;
}
 
</style>
