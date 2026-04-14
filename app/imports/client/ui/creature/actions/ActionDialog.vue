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
          size="large"
          variant="text"
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { autorun } from 'vue-meteor-tracker';
import applyAction from '/imports/api/engine/action/functions/applyAction';
import getDeterministicDiceRoller from '/imports/api/engine/action/functions/userInput/getDeterministicDiceRoller';
import EngineActions from '/imports/api/engine/action/EngineActions';
import { runAction } from '/imports/api/engine/action/methods/runAction';
import TabletopLogStreamEntry from '/imports/client/ui/tabletop/TabletopLogStreamEntry.vue';
import mutationToLogUpdates from '/imports/api/engine/action/functions/mutationToLogUpdates';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  actionId: string;
  task?: Record<string, any>;
  actionFinishedCallback?: Function;
}>();

const store = useStore(key);
const router = useRouter();

const loading = ref(false);
const actionBusy = ref(false);
const actionDone = ref(false);
const actionResult = ref<any>(undefined);
const resumeActionFn = ref<Function | undefined>(undefined);
const activeInput = ref<string | undefined>(undefined);
const activeInputParams = ref<Record<string, any>>({});
const userInput = ref<any>(undefined);
const userInputReady = ref(true);
const actionPromise = ref<any>(undefined);

let deterministicDiceRoller: Function;

const { result: action } = autorun(() => EngineActions.findOne(props.actionId));

const actionJson = computed(() => JSON.stringify(action.value, null, 2));
const resultJson = computed(() => JSON.stringify(actionResult.value, null, 2));

const simulatedLog = computed(() => {
  const a = actionResult.value;
  const content: any[] = [];
  a?.results.forEach((result: any) => {
    result.mutations.forEach((mutation: any) => {
      content.push(...mutationToLogUpdates(mutation));
    });
  });
  return {
    content,
    creatureId: a?.creatureId,
    tabletopId: a?.tabletopId,
  };
});

const inputProvider = {
  async targetIds(target: string) {
    if (router.currentRoute.value.name !== 'tabletop') return [];
    userInput.value = [];
    activeInputParams.value = {
      target,
      tabletopId: action.value?.tabletopId,
    };
    activeInput.value = 'targets-input';
    return promiseInput();
  },
  async rollDice(dice: any[]) {
    return Promise.resolve(deterministicDiceRoller(dice));
  },
  async nextStep(task: any) {
    return promiseInput();
  },
  async choose(choices: any[], quantity: any) {
    userInput.value = [];
    activeInputParams.value = { choices, quantity };
    activeInput.value = 'choice-input';
    return promiseInput();
  },
  async advantage(suggestedAdvantage: any) {
    userInput.value = suggestedAdvantage;
    activeInput.value = 'advantage-input';
    userInputReady.value = true;
    return promiseInput();
  },
  async check(suggestedParams: any) {
    userInput.value = suggestedParams;
    activeInput.value = 'check-input';
    return promiseInput();
  },
  async castSpell(suggestedParams: any) {
    userInput.value = suggestedParams;
    activeInputParams.value = { creatureId: action.value?.creatureId };
    activeInput.value = 'cast-spell-input';
    return promiseInput();
  },
};

onMounted(() => {
  deterministicDiceRoller = getDeterministicDiceRoller(props.actionId);
  startAction({ stepThrough: false });
});

async function startAction({ stepThrough }: { stepThrough: boolean }) {
  actionBusy.value = true;
  actionResult.value = {
    ...action.value,
    _stepThrough: undefined,
    _isSimulation: undefined,
    taskCount: undefined,
  };
  await applyAction(actionResult.value, inputProvider, { simulate: true, stepThrough });
  const result = await runAction.callAsync({
    actionId: actionResult.value._id,
    decisions: actionResult.value._decisions,
  });
  actionDone.value = true;
  actionBusy.value = false;
  activeInput.value = undefined;
  if (props.actionFinishedCallback) props.actionFinishedCallback(result);
}

function stepAction() {
  if (actionResult.value) actionResult.value._stepThrough = true;
  resumeActionFn.value?.();
}

function continueAction() {
  if (actionResult.value) actionResult.value._stepThrough = false;
  resumeActionFn.value?.();
}

async function finishAction() {
  store.dispatch('popDialogStack', actionResult.value);
}

function promiseInput(): Promise<any> {
  return new Promise(resolve => {
    resumeActionFn.value = () => {
      resumeActionFn.value = undefined;
      const savedInput = userInput.value;
      userInput.value = undefined;
      activeInput.value = undefined;
      activeInputParams.value = {};
      userInputReady.value = false;
      resolve(savedInput);
    };
  });
}

function setInputReady(val: boolean) {
  userInputReady.value = val;
}

function cancel() {
  store.dispatch('popDialogStack');
}
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
