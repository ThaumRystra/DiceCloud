<template lang="html">
  <v-list-item
    class="ability-list-tile pl-0"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-item-action
      class="ma-0"
      style="min-width: 40px;"
    >
      <v-btn
        class="mr-4 py-2"
        text
        height="82"
        :data-id="`check-btn-${model._id}`"
        :loading="checkLoading"
        :disabled="!context.editPermission"
        @click.stop="check"
      >
        <div>
          <div class="text-h4 mod">
            <template v-if="swapScoresAndMods">
              <span :class="{'primary--text': model.total !== model.value}">
                {{ model.value }}
              </span>
            </template>
            <template v-else>
              {{ numberToSignedString(model.modifier) }}
            </template>
          </div>
          <div class="text-h6 value">
            <template v-if="swapScoresAndMods">
              {{ numberToSignedString(model.modifier) }}
            </template>
            <template v-else>
              <span :class="{'primary--text': model.total !== model.value}">
                {{ model.value }}
              </span>
            </template>
          </div>
        </div>
      </v-btn>
    </v-list-item-action>

    <v-list-item-content>
      <v-list-item-title>
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
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="js">
import numberToSignedString from '/imports/api/utility/numberToSignedString';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import doAction from '/imports/client/ui/creature/actions/doAction';

export default {
  inject: {
    context: {
      default: {},
    },
  },
  props: {
    model: { type: Object, required: true },
  },
  data() {
    return {
      checkLoading: false,
    }
  },
  computed: {
    hasClickListener() {
      return this.$listeners && this.$listeners.click
    },
  },
  methods: {
    numberToSignedString,
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
        skillVariableName: undefined,
        abilityVariableName: this.model.variableName,
        dc: null,
      }).catch(error => {
        snackbar({ text: error.reason || error.message || error.toString() });
        console.error(error);
      }).finally(() => {
        this.checkLoading = false;
      });
    },
  },
  meteor: {
    swapScoresAndMods() {
      let user = Meteor.user();
      return user &&
        user.preferences &&
        user.preferences.swapAbilityScoresAndModifiers;
    }
  }
}
</script>

<style lang="css" scoped>
.ability-list-tile {
  background: inherit;
}

.ability-list-tile>>>.v-list__tile {
  height: 88px;
}

.ability-list-tile>>>.v-list__tile__action--stack {
  justify-content: center;
}

.value {
  font-weight: 600;
  font-size: 24px !important;
  color: rgba(0, 0, 0, 0.54);
}

.theme--dark .value {
  color: rgba(255, 255, 255, 0.54);
}

.mod,
.value {
  text-align: center;
  width: 100%;
  min-width: 42px;
}
</style>
