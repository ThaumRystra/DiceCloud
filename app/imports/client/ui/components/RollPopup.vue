<template lang="html">
  <div>
    <v-menu
      v-model="open"
      origin="center center"
      transition="scale-transition"
      nudge-left="100px"
      nudge-top="100px"
      :close-on-content-click="false"
    >
      <template #activator="{ on }">
        <v-btn
          v-bind="$attrs"
          :class="buttonClass"
          v-on="on"
          @click.stop
        >
          <slot />
        </v-btn>
      </template>
      <v-sheet class="d-flex flex-column align-center justify-center">
        <v-btn-toggle
          v-model="dataAdvantage"
          color="accent"
        >
          <v-btn :value="-1">
            Disadvantage
          </v-btn>
          <v-btn :value="1">
            Advantage
          </v-btn>
        </v-btn-toggle>
        <div class="ma-1 text-subtitle-2">
          {{ name }}
        </div>
        <div>
          <v-scale-transition
            origin="center center"
          >
            <vertical-hex
              v-if="dataAdvantage"
              style="position:absolute; transition: margin-left 0.3s ease;"
              :style="{marginLeft: dataAdvantage == 1 ? '24px' : '-24px'}"
              disable-hover
            />
          </v-scale-transition>
          <vertical-hex @click="roll">
            <div>
              Roll
            </div>
            <div v-if="rollText">
              {{ rollText }}
            </div>
          </vertical-hex>
        </div>
        <v-btn
          text
          color="primary"
          style="align-self: end"
          @click="close"
        >
          Cancel
        </v-btn>
      </v-sheet>
    </v-menu>
  </div>
</template>

<script lang="js">
import VerticalHex from '/imports/client/ui/components/VerticalHex.vue';

export default {
  components: {
    VerticalHex
  },
  props: {
    name: {
      type: String,
      default: undefined,
    },
    rollText: {
      type: String,
      default: undefined,
    },
    buttonClass: {
      type: String,
      default: undefined,
    },
    advantage: {
      type: Number,
      default: undefined,
    },
  },
  data(){return {
    open: false,
    dataAdvantage: this.advantage,
  }},
  watch: {
    advantage(val){
      this.dataAdvantage = val;
    },
    open(val){
      if(!val){
        this.dataAdvantage = this.advantage;
      }
    },
  },
  methods: {
    roll(){
      this.$emit('roll', {advantage: this.dataAdvantage});
      this.open = false;
    },
    close(){
      this.open = false;
    }
  },
}
</script>

<style lang="css" scoped>
</style>
