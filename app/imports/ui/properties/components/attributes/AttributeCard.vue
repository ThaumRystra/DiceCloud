<template lang="html">
  <v-card
    :hover="hasClickListener"
    @click="click"
    @mouseover="hasClickListener ? hovering = true : undefined"
    @mouseleave="hasClickListener ? hovering = false : undefined"
  >
    <div class="layout align-center">
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
    <card-highlight :active="hasClickListener && hovering" />
  </v-card>
</template>

<script lang="js">
  import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
  import RollPopup from '/imports/ui/components/RollPopup.vue';
  import doCheck from '/imports/api/engine/actions/doCheck.js';
  import {snackbar} from '/imports/ui/components/snackbars/SnackbarQueue.js';
  import CardHighlight from '/imports/ui/components/CardHighlight.vue';

  export default {
    components: {
      RollPopup,
      CardHighlight,
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
      hasClickListener(){
        return this.$listeners && !!this.$listeners.click
      },
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
      click(e){
        this.$emit('click', e);
      },
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
