<template lang="html">
  <div :key="id">
    <v-progress-linear
      v-if="!subsReady"
      indeterminate
      color="accent"
    />
    <v-expand-transition>
      <div
        v-if="subsReady"
        class="pt-4"
      >
        <component
          :is="model.type"
          :model="model"
          class="property-viewer"
        />
        <tree-node-list
          group="library-node-expansion"
          :root="{ collection: 'libraryNodes', id: id }"
          :children="propertyChildren"
          @selected="clickChild"
        />
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import { docsToForest, getFilter } from '/imports/api/parenting/parentingFunctions';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import TreeNodeList from '/imports/client/ui/components/tree/TreeNodeList.vue';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{ id: string }>();
const store = useStore(key);

const { result: libraryNodeSubReady } = autorun(() => {
  const handle = Meteor.subscribe('libraryNode', props.id);
  return handle.ready();
});

const { result: descendantLibraryNodesSubReady } = autorun(() => {
  const handle = Meteor.subscribe('descendantLibraryNodes', props.id);
  return handle.ready();
});

const { result: model } = autorun(() => LibraryNodes.findOne(props.id));

const { result: propertyChildren } = autorun(() => {
  if (!model.value) return [];
  const descendants = LibraryNodes.find({
    ...getFilter.descendants(model.value),
    removed: { $ne: true },
  }).fetch();
  return docsToForest(descendants);
});

const subsReady = computed(() => libraryNodeSubReady.value && descendantLibraryNodesSubReady.value);

function clickChild(id: string) {
  store.commit('pushDialogStack', {
    component: 'library-node-dialog',
    elementId: `tree-node-${id}`,
    data: { _id: id },
  });
}
</script>

<style lang="css" scoped></style>
