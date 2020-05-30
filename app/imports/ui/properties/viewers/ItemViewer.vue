<template lang="html">
  <div class="item-viewer">
    <div
      v-if="tagString"
      class="tags ma-3"
    >
      {{ tagString }}
    </div>
    <div
      v-if="model.quantity > 1 || model.showIncrement"
      class="layout column justify-center align-center"
    >
      <div class="display-1">
        {{ model.quantity }}
      </div>
      <increment-button
        v-if="context.creature && model.showIncrement"
        icon
        large
        outline
        color="primary"
        :value="model.quantity"
        @change="changeQuantity"
      >
        <svg-icon
          :shape="getIcon('abacus').shape"
        />
      </increment-button>
    </div>
    <div class="layout row wrap justify-space-around">
      <div
        v-if="model.value !== undefined"
        class="mr-3 my-3"
      >
        <v-layout
          v-if="model.quantity > 1"
          row
          align-center
          class="mb-2"
        >
          <svg-icon
            :shape="getIcon('cash').shape"
            class="mr-2"
            x-large
          />
          <coin-value
            class="title"
            :value="totalValue"
          />
        </v-layout>
        <v-layout
          row
          align-center
        >
          <svg-icon
            :shape="getIcon('two-coins').shape"
            class="mr-2"
            x-large
          />
          <coin-value
            class="title mr-2"
            :value="model.value"
          />
          <span
            v-if="model.quantity > 1"
            class="title"
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
          row
          align-center
          justify-end
          class="mb-2"
        >
          <span class="title">
            {{ totalWeight }} lb
          </span>
          <svg-icon
            :shape="getIcon('injustice').shape"
            class="ml-2"
            x-large
          />
        </v-layout>
        <v-layout
          row
          align-center
          justify-end
        >
          <span class="title mr-2">
            {{ model.weight }} lb
          </span>
          <span
            v-if="model.quantity > 1"
            class="title"
          >
            each
          </span>
          <svg-icon
            :shape="getIcon('weight').shape"
            class="ml-2"
            x-large
          />
        </v-layout>
      </div>
    </div>
    <property-description
      v-if="model.description"
      :value="model.description"
    />
  </div>
</template>

<script>
import SVG_ICONS from '/imports/constants/SVG_ICONS.js';
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
import CoinValue from '/imports/ui/components/CoinValue.vue';
import IncrementButton from '/imports/ui/components/IncrementButton.vue';
import { adjustQuantity } from '/imports/api/creature/CreatureProperties.js';

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
    tagString(){
      return this.model.tags && this.model.tags.join(', ');
    },
    totalValue(){
      return this.model.value * this.model.quantity;
    },
    totalWeight(){
      return this.model.weight * this.model.quantity;
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
