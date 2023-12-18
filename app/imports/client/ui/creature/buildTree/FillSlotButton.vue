<template functional>
  <v-btn
    v-if="!model.quantityExpected || !model.quantityExpected.value || model.spaceLeft"
    :icon="!$slots.default"
    v-bind="$attrs"
    :data-id="`slot-add-button-${model._id}`"
    class="slot-add-button accent--text"
    @click.stop="fillSlot()"
  >
    <slot>
      <v-icon>mdi-plus</v-icon>
    </slot>
  </v-btn>
</template>

<script lang="js">
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';

export default {
  inject: {
    context: { default: {} }
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  methods: {
    fillSlot(){
      let slotId = this.model._id;
      let creatureId = this.context.creatureId;
      this.$store.commit('pushDialogStack', {
        component: 'slot-fill-dialog',
        elementId: `slot-add-button-${slotId}`,
        data: {
          slotId,
          creatureId,
        },
        callback(nodeIds){
          if (!nodeIds || !nodeIds.length) return;
          let newPropertyId = insertPropertyFromLibraryNode.call({
            nodeIds,
            parentRef: {
              'id': slotId,
              'collection': 'creatureProperties',
            },
          });
          return `slot-child-${newPropertyId}`;
        }
      });
    },
  },
}
</script>

<style>

</style>