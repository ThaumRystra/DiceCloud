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
      :animation="200"
      @change="change"
    >
      <item-list-tile
        v-for="item in dataItems"
        :key="item._id"
        class="item"
        :data-id="item._id"
        :model="item"
        @click="clickProperty(item._id)"
      />
    </draggable>
  </v-list>
</template>

<script lang="js">
import draggable from 'vuedraggable';
import ItemListTile from '/imports/client/ui/properties/components/inventory/ItemListTile.vue';
import { organizeDoc } from '/imports/api/parenting/organizeMethods';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';

export default {
  components: {
    draggable,
    ItemListTile,
  },
  inject: {
    context: { default: {} }
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    parentRef: {
      type: Object,
      required: true,
    },
    preparingSpells: Boolean,
    equipment: Boolean,
  },
  data() {
    return {
      dataItems: [],
    }
  },
  computed: {
    levels() {
      let levels = new Set();
      this.items.forEach(item => levels.add(item.level));
      return levels;
    },
  },
  watch: {
    items(value) {
      this.dataItems = value;
    }
  },
  mounted() {
    this.dataItems = this.items;
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
      if (event) {
        // If this item is now adjacent to another, set the order accordingly
        let order;
        let before = this.dataItems[event.newIndex - 1];
        let after = this.dataItems[event.newIndex + 1];
        if (before && before._id) {
          order = before.order + 0.5;
        } else if (after && after._id) {
          order = after.order - 0.5;
        } else {
          order = -0.5;
        }
        let doc = event.element;
        organizeDoc.callAsync({
          docRef: {
            id: doc._id,
            collection: 'creatureProperties',
          },
          parentRef: this.parentRef,
          order,
        });
        if (doc.type === 'item' && doc.equipped != this.equipment) {
          updateCreatureProperty.call({
            _id: doc._id,
            path: ['equipped'],
            value: !!this.equipment,
          });
        }
      }
      setTimeout(() => this.dataItems = this.items, 0);
    },
  }
}
</script>
