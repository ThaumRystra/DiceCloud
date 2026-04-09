<template lang="html">
  <div
    style="height: 100%; overflow: hidden;"
    class="character-log layout column justify-end"
  >
    <v-slide-y-reverse-transition
      group
      hide-on-leave
      class="card-raised-background flex layout column reverse align-end pa-3"
      style="overflow: auto;"
    >
      <log-entry
        v-for="log in logs"
        :key="log._id"
        :model="log"
      />
    </v-slide-y-reverse-transition>
    <v-card>
      <v-text-field
        v-model="input"
        class="mx-2 mb-2"
        persistent-hint
        style="flex-grow: 0"
        append-icon="mdi-send"
        :hint="inputHint"
        :error-messages="inputError"
        :disabled="!editPermission"
        :loading="submitLoading"
        @click:append="submit"
        @keyup.enter="submit"
        @keyup.up="decrementHistory"
        @keyup.down="incrementHistory"
      />
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import { Tracker } from 'meteor/tracker';
import CreatureLogs, { logRoll } from '/imports/api/creature/log/CreatureLogs';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import { parse, prettifyParseError } from '/imports/parser/parser';
import resolve from '/imports/parser/resolve';
import toString from '/imports/parser/toString';
import LogEntry from '/imports/client/ui/log/LogEntry.vue';

const props = defineProps<{
  creatureId?: string;
  tabletopId?: string;
}>();

const inputHint = ref<string | undefined>(undefined);
const inputError = ref<string | undefined>(undefined);
const input = ref<string | undefined>(undefined);
const history = ref<string[]>([]);
const historyIndex = ref(1);
const submitLoading = ref(false);

const { result: logs } = autorun(() => {
  const filter: any = {};
  if (props.tabletopId) filter.tabletopId = props.tabletopId;
  else if (props.creatureId) filter.creatureId = props.creatureId;
  return CreatureLogs.find(filter, { sort: { date: -1 }, limit: 100 });
});

const { result: creature } = autorun(() => Creatures.findOne(props.creatureId) || {});
const { result: variables } = autorun(() =>
  CreatureVariables.findOne({ _creatureId: props.creatureId }) || {}
);
const { result: editPermission } = autorun(() => {
  if (!(creature.value as any)?._id) return false;
  try {
    assertEditPermission(creature.value, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
});

watch(input, (value) => {
  input.value = value;
  recalculate();
});

watch(() => props.creatureId, () => {
  Tracker.afterFlush(() => recalculate());
});

watch(historyIndex, (i) => {
  if (typeof history.value[i] === 'string') {
    input.value = history.value[i];
  }
});

async function submit() {
  if (!input.value) return;
  if (submitLoading.value) return;
  const log: any = { roll: input.value };
  if (props.tabletopId) log.tabletopId = props.tabletopId;
  if (props.creatureId) log.creatureId = props.creatureId;
  submitLoading.value = true;
  try {
    await logRoll.callAsync(log);
    submitLoading.value = false;
    addHistory(input.value);
    input.value = '';
    inputError.value = undefined;
  } catch (error: any) {
    submitLoading.value = false;
    inputError.value = error.message || error.toString();
    console.error(error);
  }
}

function addHistory(string: string) {
  if (string === history.value[history.value.length - 1]) return;
  history.value.push(string);
  if (history.value.length > 50) history.value.shift();
  historyIndex.value = history.value.length;
}

async function recalculate() {
  inputHint.value = undefined;
  inputError.value = undefined;
  if (!input.value) return;
  let result;
  try {
    result = parse(input.value);
  } catch (e: any) {
    if (e?.constructor?.name === 'EndOfInputError') {
      inputError.value = '...';
    } else {
      inputError.value = prettifyParseError(e);
    }
    return;
  }
  try {
    const { result: compiled } = await resolve('compile', result, variables.value);
    inputHint.value = toString(compiled);
  } catch (e) {
    console.warn(e);
    inputError.value = 'Compilation error';
  }
}

function incrementHistory() {
  if (historyIndex.value < history.value.length) historyIndex.value += 1;
}

function decrementHistory() {
  if (historyIndex.value > 0) historyIndex.value -= 1;
}
</script>

<style lang="css">
  .log-tab p:last-child {
    margin-bottom: 0;
  }
</style>
resolveimport { toString } from '/imports/parser/toString';
