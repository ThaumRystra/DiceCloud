<template lang="html">
  <v-list-item
    class="skill-list-tile pl-0"
    style="min-height: 36px;"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-item-content class="py-0">
      <v-list-item-title class="d-flex align-center">
        <roll-popup
          v-if="!hideModifier"
          class="prof-mod mr-1 flex-shrink-0"
          button-class="pl-3 pr-2"
          text
          :roll-text="displayedModifier"
          :name="model.name"
          :advantage="model.advantage"
          :loading="checkLoading"
          :disabled="!context.editPermission"
          @roll="check"
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
        </roll-popup>
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
import numberToSignedString from '../../../../../api/utility/numberToSignedString.js';
import ProficiencyIcon from '/imports/client/ui/properties/shared/ProficiencyIcon.vue';
import RollPopup from '/imports/client/ui/components/RollPopup.vue';
import doCheck from '/imports/api/engine/actions/doCheck.js';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue.js';

export default {
  components: {
    ProficiencyIcon,
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
    check({ advantage }) {
      this.checkLoading = true;
      doCheck.call({
        propId: this.model._id,
        scope: {
          '~checkAdvantage': { value: advantage },
        },
      }, error => {
        this.checkLoading = false;
        if (error) {
          console.error(error);
          snackbar({ text: error.reason });
        }
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
