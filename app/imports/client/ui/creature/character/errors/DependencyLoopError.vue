<script setup lang="ts">
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import { reverse } from 'lodash';
import { key } from '/imports/client/ui/vuexStore';

const props = withDefaults(defineProps<{
  model?: any;
}>(), {
  model: undefined,
});

const store = useStore(key);

const { result: loopProperties } = autorun(() => {
  if (!props.model) return undefined;
  const propAddresses = props.model.details?.nodes || [];
  const result = propAddresses.map((propAddress: string) => {
    const [id, ...path] = propAddress.split('.');
    const prop = CreatureProperties.findOne(id);
    if (prop) {
      (prop as any).path = path && path.join('.');
      if ((prop as any).name && (prop as any).path) (prop as any).name += ` [${(prop as any).path}]`;
      return prop;
    } else {
      return { name: propAddress };
    }
  });
  return reverse(result);
});

function click(id: string) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `breadcrumb-${id}`,
    data: { _id: id },
  });
}
</script>

<template>
  <v-alert
    border="bottom"
    colored-border
    elevation="2"
    type="warning"
    class="dependency-loop-error"
  >
    <p>
      The character contains a dependency loop.
    </p>
    <p>
      A set of properties may have been calculated incorrectly, because they form an infinite loop:
    </p>
    <div class="d-flex align-center flex-wrap">
      <template v-for="(prop, index) in loopProperties">
        <v-icon
          v-if="index !== 0"
          :key="index"
        >
          mdi-chevron-right
        </v-icon>
        <a
          v-if="prop.type"
          :key="index + 'link'"
          :data-id="`breadcrumb-${prop._id}`"
          @click="click(prop._id)"
        >
          <tree-node-view
            :model="prop"
            class="breadcrumb-tree-node-view"
          />
        </a>
        <span
          v-else
          :key="index + 'variable'"
          style="font-family: monospace !important;"
        >
          {{ prop.name }} {{ prop.path }}
        </span>
      </template>
    </div>
  </v-alert>
</template>

<style></style>
