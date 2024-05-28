<template lang="html">
  <div class="item-viewer">
    <v-row dense>
      <property-field
        v-if="model.quantity > 1 || model.showIncrement"
        name="Quantity"
        large
      >
        <v-spacer />
        <div>{{ model.quantity }}</div>
        <v-spacer />
        <increment-button
          v-if="context.creatureId && model.showIncrement"
          icon
          large
          outlined
          color="primary"
          :loading="incrementLoading"
          :value="model.quantity"
          @change="changeQuantity"
        />
      </property-field>
      <property-field
        v-if="context.creatureId"
        name="Delete"
        center
      >
        <v-btn
          outlined
          style="font-size: 18px;"
          class="ma-2"
          :color="'primary'"
          icon
          :disabled="!context.editPermission"
          @click="$emit('remove')"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </property-field>
      <property-field
        v-if="model.value !== undefined"
        name="value"
      >
        <div style="overflow: hidden;">
          <v-layout
            v-if="model.quantity > 1"
            align-center
            class="mb-2"
          >
            <v-icon
              class="mr-2"
              large
            >
              $vuetify.icons.cash
            </v-icon>
            <coin-value
              class="text-subtitle-1"
              :value="totalValue"
            />
          </v-layout>
          <v-layout align-center>
            <v-icon
              class="mr-2"
              large
            >
              $vuetify.icons.two_coins
            </v-icon>
            <coin-value
              class="text-subtitle-1 mr-2"
              :value="model.value"
            />
            <span
              v-if="model.quantity > 1"
              class="text-subtitle-1"
            >
              each
            </span>
          </v-layout>
        </div>
      </property-field>
      <property-field
        v-if="model.weight !== undefined"
        name="Weight"
      >
        <div style="overflow: hidden;">
          <v-layout
            v-if="model.quantity > 1"
            align-center
            class="mb-2"
          >
            <v-icon
              class="mr-2"
              large
            >
              $vuetify.icons.injustice
            </v-icon>
            <span class="text-subtitle-1">
              {{ totalWeight }} lb
            </span>
          </v-layout>
          <v-layout
            align-center
          >
            <v-icon
              class="mr-2"
              large
            >
              $vuetify.icons.weight
            </v-icon>
            <span class="text-subtitle-1 mr-2">
              {{ model.weight }} lb
            </span>
            <span
              v-if="model.quantity > 1"
              class="text-subtitle-1"
            >
              each
            </span>
          </v-layout>
        </div>
      </property-field>
      <property-field v-if="model.equipped">
        <v-icon
          style="overflow: hidden;"
          class="ma-1"
        >
          mdi-account-arrow-left
        </v-icon>
        <span class="ml-1">Equipped</span>
      </property-field>
      <property-field
        v-if="model.requiresAttunement && context.creatureId"
        name="Requires attunement"
      >
        <smart-switch
          class="ml-4"
          label="Attuned"
          :value="model.attuned"
          @change="(value, ack) => $emit('change', { path: ['attuned'], value, ack })"
        />
      </property-field>
      <property-field v-if="model.requiresAttunement && !context.creatureId">
        <template v-if="model.attuned">
          <v-icon
            style="overflow: hidden;"
            class="ma-1"
          >
            $vuetify.icons.spell
          </v-icon>
          <span class="ml-1">Attuned</span>
        </template>
        <template v-else>
          Requires attunement
        </template>
      </property-field>
      <property-description
        name="Description"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import SVG_ICONS from '/imports/constants/SVG_ICONS';
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'
import CoinValue from '/imports/client/ui/components/CoinValue.vue';
import IncrementButton from '/imports/client/ui/components/IncrementButton.vue';
import adjustQuantity from '/imports/api/creature/creatureProperties/methods/adjustQuantity';
import stripFloatingPointOddities from '/imports/api/engine/computation/utility/stripFloatingPointOddities';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';

export default {
  components: {
    IncrementButton,
    CoinValue,
  },
  mixins: [propertyViewerMixin],
  inject: {
    context: { default: {} }
  },
  data() {
    return {
      incrementLoading: false,
    }
  },
  computed: {
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
  methods: {
    getIcon(name) {
      return SVG_ICONS[name];
    },
    changeQuantity({ type, value }) {
      this.incrementLoading = true;
      adjustQuantity.call({
        _id: this.model._id,
        operation: type,
        value: value
      }, error => {
        this.incrementLoading = false;
        if (error) {
          snackbar({ text: error.reason });
          console.error(error);
        }
      });
    },
  }
}
</script>

<style lang="css" scoped>

</style>
