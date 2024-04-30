<template lang="html">
  <toolbar-card
    :color="model.color"
    :data-id="model._id"
    @toolbarclick="clickContainer(model._id)"
  >
    <template slot="toolbar">
      <v-toolbar-title>
        {{ model.name }}
      </v-toolbar-title>
      <v-spacer />
      <v-toolbar-title>
        <v-icon
          small
          style="width: 16px;"
          class="mr-1"
        >
          $vuetify.icons.weight
        </v-icon>
        {{ weight }}
      </v-toolbar-title>
      <v-toolbar-title
        class="layout align-center"
        style="flex-grow: 0;"
      >
        <v-icon
          small
          style="width: 16px;"
          class="mr-1"
        >
          $vuetify.icons.two_coins
        </v-icon>
        <coin-value :value="value" />
      </v-toolbar-title>
    </template>
    <v-card-text class="px-0">
      <item-list
        :items="items"
        :parent-ref="{id: model._id, collection: 'creatureProperties'}"
      />
    </v-card-text>
  </toolbar-card>
</template>

<script lang="js">
import ToolbarCard from '/imports/client/ui/components/ToolbarCard.vue';
import ItemList from '/imports/client/ui/properties/components/inventory/ItemList.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import CoinValue from '/imports/client/ui/components/CoinValue.vue';
import stripFloatingPointOddities from '/imports/api/engine/computation/utility/stripFloatingPointOddities';

export default {
  components: {
    ToolbarCard,
    ItemList,
    CoinValue,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    weight() {
      const contentWeight = this.model.contentsWeightless ?
        0 :
        this.model.contentsWeight || 0;
      const ownWeight = this.model.weight || 0;
      return stripFloatingPointOddities(contentWeight + ownWeight);
    },
    value() {
      const contentValue = this.model.contentsValue || 0;
      const ownValue = this.model.value || 0;
      return contentValue + ownValue;
    }
  },
  methods: {
    clickContainer(_id) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `${_id}`,
        data: { _id },
      });
    },
    clickProperty(_id) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `tree-node-${_id}`,
        data: { _id },
      });
    },
  },
  meteor: {
    items() {
      return CreatureProperties.find({
        'parentId': this.model._id,
        type: { $in: ['item', 'container'] },
        removed: { $ne: true },
        equipped: { $ne: true },
        deactivatedByAncestor: { $ne: true },
        deactivatedByToggle: { $ne: true },
      }, {
        sort: { left: 1 },
      });
    },
  }
};
</script>

<style lang="css" scoped>

</style>
