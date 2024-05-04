<template>
  <div
    class="layout align-center"
    @click="$emit('click')" 
    @mouseover="$emit('mouseover')"
    @mouseleave="$emit('mouseleave')"
  >
    <v-btn
      v-if="model.attributeType === 'modifier' || model.type === 'skill'"
      class="px-0"
      text
      height="70"
      min-width="72"
      :loading="checkLoading"
      :disabled="!context.editPermission"
      @click.stop="check"
    >
      <v-card-title class="value text-h4 flex-shrink-0">
        {{ computedValue }}
      </v-card-title>
    </v-btn>
    <v-card-title
      v-else
      class="value text-h4 flex-shrink-0"
    >
      {{ computedValue }}
    </v-card-title>
    <v-card-title class="name text-subtitle-1 text-truncate d-block pl-0">
      {{ model.name }}
      <v-icon
        v-if="model.advantage > 0"
        right
      >
        mdi-chevron-double-up
      </v-icon>
      <v-icon
        v-if="model.advantage < 0"
        right
      >
        mdi-chevron-double-down
      </v-icon>
    </v-card-title>
  </div>
</template>

<script lang="js">
import {snackbar} from '/imports/client/ui/components/snackbars/SnackbarQueue';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import doAction from '/imports/client/ui/creature/actions/doAction';

export default {
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
    check(){
      this.checkLoading = true;
      doAction(this.model, this.$store, `check-btn-${this.model._id}`, {
        subtaskFn: 'check',
        prop: this.model,
        targetIds: [this.model.root.id],
        advantage: this.model.advantage,
        skillVariableName: this.model.variableName,
        abilityVariableName: this.model.ability,
        dc: null,
      }).catch(error => {
        snackbar({ text: error.reason || error.message || error.toString() });
        console.error(error);
      }).finally(() => {
        this.checkLoading = false;
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
