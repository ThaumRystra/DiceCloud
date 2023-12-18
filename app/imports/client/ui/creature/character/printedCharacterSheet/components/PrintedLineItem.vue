<template lang="html">
  <div class="printed-line-item d-flex align-start mb-0">
    <div class="quantity">
      {{ model.quantity !== 1 ? model.quantity : undefined }}
    </div>
    <div class="text flex-grow-1">
      {{ title }}
      <template v-if="attunementText">
        ({{ attunementText }})
      </template>
    </div>
    <div class="weight-value d-flex flex-column align-end">
      <div
        v-if="model.quantity !== 1"
        class="each d-flex align-center"
      >
        <coin-value
          v-if="model.value"
          class="value text-no-wrap"
          :value="model.value"
        />
        <div
          class="weight text-no-wrap"
        >
          <template
            v-if="model.weight"
          >
            {{ model.weight }} lb
          </template>
        </div>
      </div>
      <div class="total d-flex align-center">
        <coin-value
          v-if="totalValue"
          class="value text-no-wrap"
          :value="totalValue"
        />
        <div
          class="weight text-no-wrap"
        >
          <template
            v-if="model.weight"
          >
            {{ totalWeight }} lb
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js">
import PROPERTIES from '/imports/constants/PROPERTIES';
import stripFloatingPointOddities from '/imports/api/engine/computation/utility/stripFloatingPointOddities';
import CoinValue from '/imports/client/ui/components/CoinValue.vue';

export default {
  components: {
    CoinValue,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    title() {
      let model = this.model;
      if (!model) return;
      if (model.quantity !== 1) {
        if (model.plural) {
          return model.plural;
        } else if (model.name) {
          return model.name;
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
  .quantity {
    flex-basis: 32px;
    font-weight: 700;
    text-align: end;
    padding-right: 8px;
  }
  .each {
    font-weight: 300;
  }
  .total {
    font-weight: 500;
  }
  .value {
    min-width: 40px;
    text-align: end;
  }
  .weight {
    min-width: 40px;
    text-align: end;
  }
</style>