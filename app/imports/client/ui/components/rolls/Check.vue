<template lang="html">
  <v-card>
    <template v-if="!result">
      <v-btn-toggle v-model="advantage">
        <v-btn text>
          Advantage
        </v-btn>
        <v-btn text>
          Disadvantage
        </v-btn>
      </v-btn-toggle>
      <v-card-text>
        <div class="layout justify-center align-center">
          <v-btn
            large
            fab
            outlined
            @click="makeRoll"
          >
            <div class="text-h4">
              {{ numberToSignedString(bonus) }}
            </div>
          </v-btn>
        </div>
      </v-card-text>
    </template>
    <template v-else>
      <div>
        <div class="text-h6">
          <span
            v-for="(roll, index) of rolls"
            :key="index"
            class="roll"
            :class="{strikethrough: index !== chosenRollIndex}"
          >
            {{ roll }}
          </span>
          <span class="ml-1">
            {{ numberToSignedString(bonus) }}
          </span>
        </div>
        <div class="text-h4">
          {{ result }}
        </div>
      </div>
    </template>
  </v-card>
</template>

<script lang="js">
import numberToSignedString from '../../../../api/utility/numberToSignedString.js';
export default {
  props: {
    attributeVarName: {
      type: String,
      default: '',
    },
    attributeName: {
      type: String,
      default: '',
    },
    creatureId: {
      type: String,
      default: '',
    },
    bonus: {
      type: Number,
      required: true,
    },
  },
  data(){return {
    advantage: undefined,
    result: undefined,
    rolls: undefined,
    chosenRoll: undefined,
    chosenRollIndex: undefined,
  }},
  methods: {
    makeRoll(){
      //let {rolls, bonus, chosenRoll, result} = doCheckWork.call();
      this.rolls = [12, 8];
      if (this.advantage === 1){
        this.chosenRoll = 8;
      } else {
        this.chosenRoll = 12;
      }
      this.result = this.chosenRoll + this.bonus;
      this.chosenRollIndex = this.rolls.indexOf(this.chosenRoll);
    },
    numberToSignedString,
  }
}
</script>

<style lang="css" scoped>
  .strikethrough {
    text-decoration: line-through;
  }
</style>
