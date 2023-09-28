<template>
  <div class="item">
    <div class="d-flex justify-space-between">
      <div class="label">
        {{ title }}
        <template v-if="attunementText">
          ({{ attunementText }})
        </template>
      </div>
      <property-icon
        class="ml-2"
        color="rgba(0,0,0,0.7)"
        :model="model"
      />
    </div>

    <div
      v-if="model.value !== undefined || model.weight !== undefined"
      class="weight-value my-2 d-flex justify-space-between"
    >
      <div class="value ml-4">
        <div
          v-if="model.value !== undefined"
        >
          <v-layout
            v-if="model.quantity > 1"
            align-center
            class="mb-2"
          >
            <v-icon
              class="mr-2"
              small
            >
              $vuetify.icons.cash
            </v-icon>
            <coin-value
              :value="model.value * model.quantity"
            />
          </v-layout>
          <v-layout align-center>
            <v-icon
              class="mr-2"
              small
            >
              $vuetify.icons.two_coins
            </v-icon>
            <coin-value
              class="mr-2"
              :value="model.value"
            />
            <span
              v-if="model.quantity > 1"
              class="ml-1"
            >
              each
            </span>
          </v-layout>
        </div>
      </div>
  
      <div class="weight ml-4">
        <div
          v-if="model.weight !== undefined"
        >
          <v-layout
            v-if="model.quantity > 1"
            align-center
            class="mb-2"
          >
            <v-icon
              class="mr-2"
              small
            >
              $vuetify.icons.injustice
            </v-icon>
            {{ totalWeight }} lb
          </v-layout>
          <v-layout align-center>
            <v-icon
              class="mr-2"
              small
            >
              $vuetify.icons.weight
            </v-icon>
            {{ model.weight }} lb
            <span
              v-if="model.quantity > 1"
              class="ml-1"
            >
              each
            </span>
          </v-layout>
        </div>
      </div>
    </div>

    <property-description
      text
      :model="model.description"
    />
  </div>
</template>

<script lang="js">
import treeNodeViewMixin from '/imports/client/ui/properties/treeNodeViews/treeNodeViewMixin';
import PROPERTIES from '/imports/constants/PROPERTIES';
import CoinValue from '/imports/client/ui/components/CoinValue.vue';
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';
import stripFloatingPointOddities from '/imports/api/engine/computation/utility/stripFloatingPointOddities';

export default {
  components: {
    CoinValue,
    PropertyDescription,
  },
  mixins: [treeNodeViewMixin],
  inject: {
    context: { default: {} }
  },
  props: {
    preparingSpells: Boolean,
  },
  data() {
    return {
      incrementLoading: false,
    }
  },
  computed: {
    hasClickListener() {
      return this.$listeners && !!this.$listeners.click;
    },
    title() {
      let model = this.model;
      if (!model) return;
      if (model.quantity !== 1) {
        if (model.plural) {
          return `${model.quantity} ${model.plural}`;
        } else if (model.name) {
          return `${model.quantity} ${model.name}`;
        }
      } else if (model.name) {
        return model.name;
      }
      let prop = PROPERTIES[model.type]
      return prop && prop.name;
    },
    totalValue() {
      return stripFloatingPointOddities(this.model.value * this.model.quantity);
    },
    totalWeight() {
      return stripFloatingPointOddities(this.model.weight * this.model.quantity);
    },
    attunementText() {
      if (this.model.requiresAttunement) {
        if (this.model.attuned) return 'Attuned';
        return 'Requires attunement';
      }
      return undefined;
    }
  },
}
</script>

<style lang="css" scoped>
.item-avatar {
  min-width: 32px;
}
.item .label {
  font-size: 14pt;
  font-variant: all-small-caps;
  font-weight: 600;
}
</style>
