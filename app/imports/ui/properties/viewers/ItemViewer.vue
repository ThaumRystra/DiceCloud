<template lang="html">
  <div class="item-viewer">
    <property-tags :tags="model.tags" />
    <div
      v-if="model.quantity > 1 || model.showIncrement"
      class="layout justify-center align-center wrap"
    >
      <div class="text-h4 mr-3">
        {{ model.quantity }}
      </div>
      <increment-button
        v-if="context.creatureId && model.showIncrement"
        icon
        large
        outlined
        color="primary"
        :value="model.quantity"
        @change="changeQuantity"
      >
        <v-icon>$vuetify.icons.abacus</v-icon>
      </increment-button>
    </div>
    <div class="layout wrap justify-space-around">
      <div
        v-if="model.value !== undefined"
        class="mr-3 my-3"
      >
        <v-layout
          v-if="model.quantity > 1"
          align-center
          class="mb-2"
        >
          <v-icon
            class="mr-2"
            x-large
          >
            $vuetify.icons.cash
          </v-icon>
          <coin-value
            class="text-h6"
            :value="totalValue"
          />
        </v-layout>
        <v-layout
          align-center
        >
          <v-icon
            class="mr-2"
            x-large
          >
            $vuetify.icons.two_coins
          </v-icon>
          <coin-value
            class="text-h6 mr-2"
            :value="model.value"
          />
          <span
            v-if="model.quantity > 1"
            class="text-h6"
          >
            each
          </span>
        </v-layout>
      </div>
      <div
        v-if="model.weight !== undefined"
        class="my-3"
      >
        <v-layout
          v-if="model.quantity > 1"
          align-center
          justify-end
          class="mb-2"
        >
          <span class="text-h6">
            {{ totalWeight }} lb
          </span>
          <v-icon
            class="ml-2"
            x-large
          >
            $vuetify.icons.injustice
          </v-icon>
        </v-layout>
        <v-layout
          align-center
          justify-end
          :class="{'mb-2': model.attuned}"
        >
          <span class="text-h6 mr-2">
            {{ model.weight }} lb
          </span>
          <span
            v-if="model.quantity > 1"
            class="text-h6"
          >
            each
          </span>
          <v-icon
            class="ml-2"
            x-large
          >
            $vuetify.icons.weight
          </v-icon>
        </v-layout>
        <v-layout
          v-if="model.attuned"
          align-center
          justify-end
        >
          <span class="text-h6">
            Attuned
          </span>
          <v-icon
            class="ml-2"
            x-large
          >
            $vuetify.icons.spell
          </v-icon>
        </v-layout>
      </div>
    </div>
    <property-description
      :string="model.description"
      :calculations="model.descriptionCalculations"
      :inactive="model.inactive"
    />
  </div>
</template>

<script lang="js">
import SVG_ICONS from '/imports/constants/SVG_ICONS.js';
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
import CoinValue from '/imports/ui/components/CoinValue.vue';
import IncrementButton from '/imports/ui/components/IncrementButton.vue';
import adjustQuantity from '/imports/api/creature/creatureProperties/methods/adjustQuantity.js';
import stripFloatingPointOddities from '/imports/api/creature/computation/newEngine/utility/stripFloatingPointOddities.js';

export default {
  components:{
    IncrementButton,
    CoinValue,
  },
	mixins: [propertyViewerMixin],
  inject: {
    context: { default: {} }
  },
  computed:{
    totalValue(){
      return stripFloatingPointOddities(this.model.value * this.model.quantity);
    },
    totalWeight(){
      return stripFloatingPointOddities(this.model.weight * this.model.quantity);
    },
  },
  methods: {
    getIcon(name){
      return SVG_ICONS[name];
    },
    changeQuantity({type, value}) {
      adjustQuantity.call({
        _id: this.model._id,
        operation: type,
        value: value
      });
    }
  }
}
</script>

<style lang="css" scoped>
</style>
