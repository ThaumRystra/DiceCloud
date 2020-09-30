<template lang="html">
  <div
    style="min-height: calc(100vh - 96px);"
    class="layout column justify-end"
  >
    <div class="log flex layout column reverse">
      <div
        v-for="log in logs"
        :key="log._id"
      >
        {{ log.text }}
      </div>
    </div>
    <v-card>
      <v-text-field
        v-model="input"
        solo
        persistent-hint
        style="flex-grow: 0"
        :hint="inputHint"
        :error="inputError"
        :disabled="!editPermission"
        @input="inputChanged"
      />
    </v-card>
  </div>
</template>

<script>
import CreatureLogs from '/imports/api/creature/log/CreatureLogs.js';
import Creatures from '/imports/api/creature/Creatures.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { parse } from '/imports/parser/parser.js';

export default {
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
      let result;
      try {
        result = parse(value);
      } catch (e){
        console.error(e);
        this.inputError = 'Invalid syntax';
        return;
      }
      if (result === null){
        this.inputError =  '...';
        return;
      }
      try {
        let compiled = result.compile(this.creature.variables);
        this.inputHint = compiled.toString();
        return;
      } catch (e){
        console.error(e);
        this.inputError = 'Compilation error';
        return;
      }
    },
  },
  meteor: {
    logs(){
      return CreatureLogs.find({
        creatureId: this.creatureId,
      }, {
        limit: 20,
        sort: {date: -1},
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

<style lang="css" scoped>
</style>
