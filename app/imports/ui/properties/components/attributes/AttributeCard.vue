<template lang="html">
  <v-card
    :hover="hasClickListener"
    @click="click"
  >
    <v-card-text>
      <div class="layout align-center">
        <div class="value display-1 mr-1">
          {{ computedValue }}
        </div>
        <div class="name text-truncate">
          {{ model.name }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="js">
  import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
  export default {
    props: {
      model: {
        type: Object,
        required: true,
      },
    },
    computed: {
      hasClickListener(){
        return this.$listeners && !!this.$listeners.click
      },
      computedValue(){
        if (this.model.type === 'attribute'){
          if (this.model.attributeType === 'modifier'){
            return numberToSignedString(this.model.currentValue);
          } else {
            return this.model.currentValue
          }
        } else {
          return this.model.value;
        }
      }
    },
    methods: {
      signed: numberToSignedString,
      click(e){
        this.$emit('click', e);
      },
    },
  }
</script>

<style lang="css" scoped>
  .value {
    min-width: 64px;
    text-align: center;
  }
</style>
