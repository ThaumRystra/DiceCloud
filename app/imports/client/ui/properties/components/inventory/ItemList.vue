<template lang="html">
  <v-list
    dense
    class="item-list"
  >
    <draggable
      v-model="dataItems"
      style="min-height: 24px;"
      :disabled="context.editPermission === false"
      :group="`item-list`"
      ghost-class="ghost"
      draggable=".item"
      handle=".handle"
      :revert-on-spill="true"
      @change="change"
    >
      <item-list-tile
        v-for="itemId in dataItems"
        :key="itemId"
        class="item"
        :data-id="itemId"
        :item-id="itemId"
        @click="clickProperty(itemId)"
      />
    </draggable>
  </v-list>
</template>

<script lang="js">
import draggable from 'vuedraggable';
import ItemListTile from '/imports/client/ui/properties/components/inventory/ItemListTile.vue';
import { moveWithinRoot } from '/imports/api/parenting/organizeMethods';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

export default {
  components: {
    draggable,
    ItemListTile,
  },
  inject: {
    context: { default: {} }
  },
  props: {
    itemIds: {
      type: Array,
      default: () => [],
    },
    parent: {
      type: Object,
      default: () => undefined,
    },
    preparingSpells: Boolean,
    equipment: Boolean,
  },
  data() {
    return {
      dataItems: [],
    }
  },
  watch: {
    itemIds(value) {
      this.dataItems = value;
    },
  },
  mounted() {
    this.dataItems = this.itemIds;
  },
  methods: {
    clickProperty(_id) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: _id,
        data: { _id },
      });
    },
    change({ added, moved }) {
      let event = added || moved;
      if (! event) return;
      // If this item is now adjacent to another, set the order accordingly
      let order;
      const beforeId = this.dataItems[event.newIndex - 1]
      const afterId = this.dataItems[event.newIndex + 1]
      const before = beforeId && CreatureProperties.findOne(beforeId);
      const after = afterId && CreatureProperties.findOne(afterId);
      if (before) {
        order = before.right + 0.5;
      } else if (after) {
        order = after.left - 0.5;
      } else if (this.parent) {
        order = this.parent.left + 0.5;
      } else {
        order = 0.5;
      }
      let docId = event.element;
      const doc = CreatureProperties.findOne(docId);
      if (!doc) return;
      moveWithinRoot.callAsync({
        docRef: {
          id: docId,
          collection: 'creatureProperties',
        },
        newPosition: order,
      }, (e) => {
        if (e) {
          console.error(e);
          snackbar({ text: e.reason || e.message || e.toString() });
        }
      });
      if (doc.type === 'item' && doc.equipped !== this.equipment) {
        updateCreatureProperty.call({
          _id: docId,
          path: ['equipped'],
          value: !!this.equipment,
        }, (e) => {
          if (e) {
            this.dataItems = this.itemIds
            console.error(e);
            snackbar({ text: e.reason || e.message || e.toString() });
          }
        });

      }
    },
  }
}
</script>

<style lang="css" scoped>
.ghost {
  opacity: 0.1;
}
</style>
