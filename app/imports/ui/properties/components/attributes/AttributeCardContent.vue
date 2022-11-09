<template>
  <div
    class="layout align-center"
    @click="$emit('click')" 
    @mouseover="$emit('mouseover')"
    @mouseleave="$emit('mouseleave')"
  >
    <roll-popup
      v-if="model.attributeType === 'modifier' || model.type === 'skill'"
      button-class="px-0"
      text
      height="70"
      min-width="72"
      :roll-text="computedValue && computedValue.toString()"
      :name="model.name"
      :advantage="model.advantage"
      :loading="checkLoading"
      :disabled="!context.editPermission"
      @roll="check"
    >
      <v-card-title class="value text-h4 flex-shrink-0">
        {{ computedValue }}
      </v-card-title>
    </roll-popup>
    <v-card-title
      v-else
      class="value text-h4 flex-shrink-0"
    >
      {{ computedValue }}
    </v-card-title>
    <v-card-title class="name text-subtitle-1 text-truncate d-block pl-0">
      {{ model.name }}
    </v-card-title>
  </div>
</template>

<script lang="js">
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
import RollPopup from '/imports/ui/components/RollPopup.vue';
import doCheck from '/imports/api/engine/actions/doCheck.js';
import {snackbar} from '/imports/ui/components/snackbars/SnackbarQueue.js';

export default {
  components: {
    RollPopup,
  },
  inject: {
    context: {
      default: {},
    },
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  data(){return {
    checkLoading: false,
    hovering: false,
  }},
  computed: {
    computedValue(){
      if (this.model.attributeType === 'modifier' || this.model.type === 'skill'){
        return numberToSignedString(this.model.value);
      } else {
        return this.model.value
      }
    }
  },
  methods: {
    signed: numberToSignedString,
    check({advantage}){
      this.checkLoading = true;
      doCheck.call({
        propId: this.model._id,
        scope: {
          $checkAdvantage: advantage,
        },
      }, error => {
        this.checkLoading = false;
        if (error){
          console.error(error);
          snackbar({text: error.reason});
        }
      });
    },
  },
}
</script>

<style lang="css" scoped>
  .value {
    min-width: 72px;
    justify-content: center;
  }
</style>