<template lang="html">
  <v-list-item
    class="skill-list-tile pl-0"
    style="min-height: 36px;"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-item-content class="py-0">
      <v-list-item-title class="d-flex align-center">
        <v-btn
          v-if="!hideModifier"
          text
          tile
          :loading="checkLoading"
          :disabled="!context.editPermission"
          :data-id="`check-btn-${model._id}`"
          class="pl-3 pr-2 prof-mod mr-1 flex-shrink-0"
          @click.stop="check"
        >
          <proficiency-icon
            :value="model.proficiency"
            class="prof-icon"
          />
          <div class="prof-mod">
            {{ displayedModifier }}
          </div>
          <v-icon
            v-if="model.advantage > 0"
            size="20px"
          >
            mdi-chevron-double-up
          </v-icon>
          <v-icon
            v-if="model.advantage < 0"
            size="20px"
          >
            mdi-chevron-double-down
          </v-icon>
        </v-btn>
        <proficiency-icon
          v-else
          :value="model.proficiency"
          class="prof-icon ml-3 mr-2"
        />
        <div class="text-truncate">
          {{ model.name }}
          <template v-if="model.conditionalBenefits && model.conditionalBenefits.length">
            *
          </template>
          <template v-if="'passiveBonus' in model">
            ({{ passiveScore }})
          </template>
        </div>
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="js">
import ProficiencyIcon from '/imports/client/ui/properties/shared/ProficiencyIcon.vue';
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import doAction from '/imports/client/ui/creature/actions/doAction';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';

export default {
  components: {
    ProficiencyIcon,
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
    hideModifier: Boolean,
  },
  data() {
    return {
      checkLoading: false,
    }
  },
  computed: {
    displayedModifier() {
      let mod = this.model.value;
      if (this.model.fail) {
        return 'fail';
      } else {
        return numberToSignedString(mod);
      }
    },
    hasClickListener() {
      return this.$listeners && this.$listeners.click
    },
    passiveScore() {
      return 10 + this.model.value + this.model.passiveBonus;
    }
  },
  methods: {
    click(e) {
      this.$emit('click', e);
    },
    check() {
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
  }
}
</script>

<style lang="css" scoped>
.prof-icon {
  min-width: 30px;
}

.prof-mod {
  min-width: 32px;
}

.v-icon.theme--light {
  color: rgba(0, 0, 0, 0.54) !important;
}
</style>