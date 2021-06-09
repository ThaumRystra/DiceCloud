<template lang="html">
  <v-card
    :hover="hasClickListener"
    @click="click"
  >
    <div class="layout align-center">
      <v-card-title class="value text-h4">
        {{ computedValue }}
      </v-card-title>
      <v-card-title class="name text-subtitle-1 text-truncate pl-0">
        {{ model.name }}
      </v-card-title>
    </div>
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
    justify-content: center;
  }
</style>
