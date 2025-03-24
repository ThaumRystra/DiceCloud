<template lang="html">
  <div
    style="height: 100%; overflow: hidden;"
    class="character-log layout column justify-end"
  >
    <v-slide-y-reverse-transition
      group
      hide-on-leave
      class="card-raised-background flex layout column reverse align-end py-3 px-1"
      style="overflow: auto;"
    >
      <tabletop-log-entry
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
        append-outer-icon="mdi-send"
        :hint="inputHint"
        :error-messages="inputError"
        :disabled="!editPermission"
        :loading="submitLoading"
        @click:append-outer="submit"
        @keyup.enter="submit"
        @keyup.up="decrementHistory"
        @keyup.down="incrementHistory"
      />
    </v-card>
  </div>
</template>

<script lang="js">
import CreatureLogs, { logRoll } from '/imports/api/creature/log/CreatureLogs';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import { parse, prettifyParseError } from '/imports/parser/parser';
import resolve from '/imports/parser/resolve';
import toString from '/imports/parser/toString';
import TabletopLogEntry from '/imports/client/ui/log/TabletopLogEntry.vue';
import { Tracker } from 'meteor/tracker'

export default {
  components: {
    TabletopLogEntry,
  },
  props: {
    tabletopId: {
      type: String,
      default: undefined,
    },
  },
  data(){return {
    inputHint: undefined,
    inputError: undefined,
    input: undefined,
    history: [],
    historyIndex: 1,
    submitLoading: false,
    creatureId: undefined,
  }},
  watch: {
    input(value){
      this.input = value;
      this.recalculate();
    },
    creatureId() {
      Tracker.afterFlush(() => this.recalculate())
    },
    historyIndex(i) {
      if (typeof this.history[i] === 'string') {
        this.input = this.history[i];
      }
    }
  },
  mounted() {
    this.$root.$on('active-tabletop-character-change', (id) => {
      this.creatureId = id;
    });
  },
  methods: {
    submit() {
      if (!this.input) return;
      if (this.submitLoading) return;
      const log = {
        roll: this.input,
      };
      if (this.tabletopId) log.tabletopId = this.tabletopId;
      if (this.creatureId) log.creatureId = this.creatureId;
      this.submitLoading = true;
      logRoll.call(log, (error) => {
        this.submitLoading = false;
        if (!error) {
          this.addHistory(this.input);
          this.input = '';
          this.inputError = undefined;
          return;
        }
        this.inputError = error.message || error.toString();
        console.error(error);
      });
    },
    addHistory(string) {
      // Don't add duplicates back to back in history
      if (string === this.history[this.history.length - 1]) return;
      this.history.push(string);
      if (this.history.length > 50) this.history.shift();
      this.historyIndex = this.history.length;
    },
    async recalculate() {
      this.inputHint = this.inputError = undefined;
      if (!this.input) return;
      let result;
      try {
        result = parse(this.input);
      } catch (e){
        if (e?.constructor?.name === 'EndOfInputError'){
          this.inputError = '...';
        } else {
          let error = prettifyParseError(e);
          this.inputError = error;
        }
        return;
      }
      try {
        let {result: compiled} = await resolve('compile', result, this.variables);
        this.inputHint = toString(compiled);
        return;
      } catch (e){
        console.warn(e);
        this.inputError = 'Compilation error';
        return;
      }
    },
    incrementHistory() {
      if (this.historyIndex < this.history.length) {
        this.historyIndex += 1;
      }
    },
    decrementHistory() {
      if (this.historyIndex > 0) {
        this.historyIndex -= 1;
      }
    }
  },
  meteor: {
    logs() {
      const filter = {};
      if (this.tabletopId) {
        filter.tabletopId = this.tabletopId;
      } else if (this.creatureId) {
        filter.creatureId = this.creatureId;
      }
      return CreatureLogs.find(filter, {
        sort: {date: -1},
        limit: 100
      });
    },
    creature(){
      return Creatures.findOne(this.creatureId) || {};
    },
    variables(){
      return CreatureVariables.findOne({_creatureId: this.creatureId}) || {};
    },
    editPermission(){
      try {
        assertEditPermission(this.creature, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
  },
}
</script>

<style lang="css">
  .log-tab p:last-child {
    margin-bottom: 0;
  }
</style>
