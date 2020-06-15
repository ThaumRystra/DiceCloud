<template lang="html">
  <v-list v-if="items.length">
    <v-list-tile
      v-for="item in items"
      :key="item._id"
      @click="selectItem(item._id)"
    >
      <item-tree-node
        :model="item"
        :selected="itemConsumed.itemId === item._id"
      />
    </v-list-tile>
  </v-list>
  <v-card v-else>
    <v-card-text>
      No equipped items found with the tag "{{ itemConsumed.tag }}"
    </v-card-text>
  </v-card>
</template>

<script>
import ItemTreeNode from '/imports/ui/properties/treeNodeViews/ItemTreeNode.vue';
import getActiveProperties from '/imports/api/creature/getActiveProperties.js';
import { selectAmmoItem } from '/imports/api/creature/CreatureProperties.js';
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
      return getActiveProperties({
        ancestorId: this.action.ancestors[0].id,
        filter: {
          tags: this.itemConsumed.tag,
          equipped: true,
        },
        options: {
          fields: {equipped: false},
        }
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
