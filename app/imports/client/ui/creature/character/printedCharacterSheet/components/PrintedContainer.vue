<template>
  <div class="inventory-container">
    <div class="d-flex justify-center">
      <property-icon
        class="ml-2"
        color="rgba(0,0,0,0.7)"
        :model="model"
      />
      <div class="label">
        {{ model.name }}
      </div>
    </div>

    <div
      v-if="model.value !== undefined || model.weight !== undefined"
      class="weight-value my-2 d-flex justify-space-between"
    >
      <div class="value ml-4">
        <div
          v-if="model.value !== undefined"
        >
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
          </v-layout>

          <v-layout
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
              :value="model.contentsValue"
            />
            <span
              class="ml-1"
            >
              contents
            </span>
          </v-layout>
        </div>
      </div>
  
      <div class="weight ml-4">
        <div
          v-if="model.weight !== undefined"
        >
          <v-layout align-center>
            <v-icon
              class="mr-2"
              small
            >
              $vuetify.icons.weight
            </v-icon>
            {{ model.weight }} lb
          </v-layout>

          <v-layout
            align-center
            class="mb-2"
          >
            <v-icon
              class="mr-2"
              small
            >
              $vuetify.icons.injustice
            </v-icon>
            {{ model.contentsWeight }} lb
            <span
              class="ml-1"
            >
              contents
            </span>
          </v-layout>
        </div>
      </div>
    </div>
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
  },
}
</script>

<style lang="css" scoped>
.item-avatar {
  min-width: 32px;
}
</style>
