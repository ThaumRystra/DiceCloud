<template lang="html">
  <v-list v-if="items.length">
    <v-list-item
      v-for="item in items"
      :key="item._id"
      @click="selectItem(item._id)"
    >
      <item-tree-node
        :model="item"
        :selected="itemConsumed.itemId === item._id"
      />
    </v-list-item>
  </v-list>
  <v-card v-else>
    <v-card-text>
      No active items found with the tag "{{ itemConsumed.tag }}"
    </v-card-text>
  </v-card>
</template>

<script lang="js">
import ItemTreeNode from '/imports/client/ui/properties/treeNodeViews/ItemTreeNode.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import selectAmmoItem from '/imports/api/creature/creatureProperties/methods/selectAmmoItem.js';
import { findIndex } from 'lodash';
export default {
  components: {
    ItemTreeNode
  },
  props: {
    action: {
      type: Object,
      required: true,
    },
    itemConsumed: {
      type: Object,
      required: true,
    },
  },
  meteor: {
    items(){
      return CreatureProperties.find({
        'ancestors.id': this.action.ancestors[0].id,
        type: 'item',
        tags: this.itemConsumed.tag,
        removed: {$ne: true},
        inactive: {$ne: true},
      }, {
        sort: {order: 1},
        fields: {equipped: false},
      });
    }
  },
  methods:{
    selectItem(itemId){
      let itemConsumedIndex = findIndex(
        this.action.resources.itemsConsumed,
        item => item._id === this.itemConsumed._id
      );
      selectAmmoItem.call({
        actionId: this.action._id,
        itemId,
        itemConsumedIndex
      }, error => {
        if (error) console.error(error);
      });
    }
  }
}
</script>

<style lang="css" scoped>
</style>
