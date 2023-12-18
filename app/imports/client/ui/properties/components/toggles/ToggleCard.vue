<template lang="html">
  <v-card
    :class="hover ? 'elevation-8': ''"
    @click="click"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <div class="layout align-center">
      <div
        class="value layout justify-center flex-grow-0"
      >
        <smart-checkbox
          :value="toggleValue"
          :disabled="toggleDisabled"
          @change="(val, ack) => toggleToggle(val, ack)"
          @click.native.stop=""
        />
      </div>
      <v-card-title class="name text-subtitle-1 text-truncate d-block pl-0">
        {{ model.name }}
      </v-card-title>
    </div>
    <card-highlight :active="hover" />
  </v-card>
</template>

<script lang="js">
import flipToggle from '/imports/api/creature/creatureProperties/methods/flipToggle';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';

  export default {
    components: {
      CardHighlight,
    },
    props: {
      model: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        hover: false,
      }
    },
    computed: {
      hasClickListener(){
        return this.$listeners && !!this.$listeners.click
      },
      toggleValue(){
        if (this.model.enabled) return true;
        if (this.model.disabled) return false;
        if (!this.model.condition) return undefined;
        return !!this.model.condition.value
      },
      toggleDisabled(){
        return !this.model.enabled && !this.model.disabled;
      },
    },
    methods: {
      click(e){
        this.$emit('click', e);
      },
      toggleToggle(value, ack){
        flipToggle.call({
          _id: this.model._id
        }, (error) =>{
          if (error) console.warn(error);
          ack && ack(error && error.reason || error);
        });
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
