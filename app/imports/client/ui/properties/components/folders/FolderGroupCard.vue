<template>
  <div
    v-if="model.name || (properties && properties.length)"
  >
    <v-card
      class="folder-group-card pb-2"
    >
      <v-subheader v-if="model.name">
        {{ model.name }}
      </v-subheader>
      <component
        :is="prop.type"
        v-if="!model.showChildList"
        v-for="prop in properties"
        :key="prop._id"
        :model="prop"
        :data-id="prop._id"
        @click="$emit('click-property', {_id: prop._id})"
        @click-property="e => $emit('click-property', e)"
        @sub-click="e => $emit('sub-click', e)"
        @remove="id => $emit('remove', id || prop._id)"
      />
      <tree-node
        v-if="model.showChildList"
        v-for="prop in properties"
        :key="prop._id"
        class="item"
        :node="prop"
        :children="[]"
        :start-expanded="true"
        @selected="selectChildListProperty"
      />
    </v-card>
  </div>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import TreeNode from '/imports/client/ui/components/tree/TreeNode.vue';
import propComponents from '/imports/client/ui/properties/components/folders/propertyComponentIndex.js';

export default {
  components: { TreeNode, ...propComponents },
  props: {
    model: {
      type: Object,
      required: true,
    },
    collection: {
      type: String,
      default: 'creatureProperties'
    }
  },
  methods: {
    selectChildListProperty(_id){
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `tree-node-${_id}`,
        data: {
          _id,
          startInEditTab: this.editing,
        },
      });
    },
  },
  meteor: {
    properties() {
      const props = [];
      CreatureProperties.find({
        'parent.id': this.model._id,
        removed: { $ne: true },
        ...(this.model.showChildList ? {} : {
          overridden: { $ne: true },
          $or: [
            {
              type: 'toggle',
              showUI: true,
              deactivatedByAncestor: { $ne: true },
              deactivatedByToggle: { $ne: true },
            },
            {
              type: { $ne: 'toggle' },
              inactive: { $ne: true }
            },
          ],
          $nor: [
            { hideWhenTotalZero: true, total: 0 },
            { hideWhenValueZero: true, value: 0 },
          ],
        })
      }, {
        sort: { order: 1 },
      }).forEach(prop => {
        if (propComponents[prop.type]) {
          props.push(prop);
        }
      });
      return props;
    },
  },
}
</script>

<style>
.folder-group-card .v-card {
  box-shadow: none !important;
  border-radius: 0 !important;
}
.folder-group-card .drag-handle {
  display: none !important;
}
</style>