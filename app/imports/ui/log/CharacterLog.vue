<template lang="html">
  <div
    style="height: 100%; overflow: hidden;"
    class="character-log layout column justify-end"
  >
    <div
      class="log flex layout column reverse align-end pa-3"
      style="overflow: auto;"
    >
      <log-entry
        v-for="log in logs"
        :key="log._id"
        :model="log"
      />
    </div>
    <v-card>
      <v-text-field
        v-model="input"
        class="mx-2 mb-2"
        persistent-hint
        style="flex-grow: 0"
        append-outer-icon="send"
        :hint="inputHint"
        :error-messages="inputError"
        :disabled="!editPermission"
        @click:append-outer="submit"
        @keyup.enter="submit"
      />
    </v-card>
  </div>
</template>

<script>
import CreatureLogs, { logRoll } from '/imports/api/creature/log/CreatureLogs.js';
import Creatures from '/imports/api/creature/Creatures.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { parse, prettifyParseError } from '/imports/parser/parser.js';
import LogEntry from '/imports/ui/log/LogEntry.vue';

export default {
  components: {
    LogEntry,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  data(){return {
    inputHint: undefined,
    inputError: undefined,
    input: undefined,
  }},
  watch: {
    input(value){
      this.input = value;
      this.inputHint = this.inputError = undefined;
      if (!this.input) return;
      let result;
      try {
        result = parse(value);
      } catch (e){
        if (e.constructor.name === 'EndOfInputError'){
          this.inputError = '...';
        } else {
          let error = prettifyParseError(e);
          this.inputError = error;
        }
        return;
      }
      try {
        let compiled = result.compile(this.creature.variables);
        this.inputHint = compiled.toString();
        return;
      } catch (e){
        console.warn(e);
        this.inputError = 'Compilation error';
        return;
      }
    },
  },
  methods: {
    submit(){
      if (this.inputError || !this.input) return;
      logRoll.call({
        roll: this.input,
        creatureId: this.creatureId,
      }, (error) => {
        if (error) console.error(error);
      });
      this.input = '';
    },
  },
  meteor: {
    logs(){
      return CreatureLogs.find({
        creatureId: this.creatureId,
      }, {
        sort: {date: -1},
        limit: 20
      });
    },
    creature(){
      return Creatures.findOne(this.creatureId) || {};
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
