<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import { getFilter } from '/imports/api/parenting/parentingFunctions';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import { Mongo } from 'meteor/mongo';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  model: Record<string, any>;
  collection?: string;
  noLinks?: boolean;
  noIcons?: boolean;
  editing?: boolean;
  embedded?: boolean;
}>();

const emit = defineEmits<{ (e: 'select-sub-property', id: string): void }>();
const store = useStore(key);

const { result: breadcrumbProps } = autorun(() => {
  const col = props.collection ?? 'creatureProperties';
  const filter: any = {
    ...getFilter.ancestors(props.model),
  };
  if (col === 'creatureProperties') {
    filter.type = { $ne: 'propertySlot' };
  }
  return (Mongo.Collection.get(col) as any).find(filter).fetch();
});

function click(id: string) {
  if (props.embedded) {
    emit('select-sub-property', id);
    return;
  }
  let dialogFound = false;
  let dialogsToPop = 0;
  store.state.dialogStack.dialogs.forEach((dialog: any) => {
    if (dialog.data && dialog.data._id === id) {
      dialogFound = true;
      dialogsToPop = 0;
    } else {
      dialogsToPop += 1;
    }
  });
  if (dialogFound) {
    store.dispatch('popDialogStacks', dialogsToPop);
  } else {
    const component = (props.collection ?? 'creatureProperties') === 'creatureProperties'
      ? 'creature-property-dialog'
      : (props.collection ?? '') === 'libraryNodes' ? 'library-node-dialog'
        : undefined;
    store.commit('pushDialogStack', {
      component,
      elementId: `breadcrumb-${id}`,
      data: { _id: id, startInEditTab: props.editing },
    });
  }
}

function clickRootCreature() {
  let dialogFound = false;
  let dialogsToPop = 0;
  store.state.dialogStack.dialogs.forEach((dialog: any) => {
    if (dialog.component === 'creature-root-dialog') {
      dialogFound = true;
      dialogsToPop = 0;
    } else {
      dialogsToPop += 1;
    }
  });
  if (dialogFound) {
    store.dispatch('popDialogStacks', dialogsToPop);
  } else {
    store.commit('pushDialogStack', {
      component: 'creature-root-dialog',
      elementId: 'breadcrumb-root',
      data: { _id: props.model.root.id, startInEditTab: props.editing },
    });
  }
}
</script>

<template lang="html">
  <div
    class="breadcrumbs layout align-center wrap"
    :class="{ 'no-icons': noIcons }"
  >
    <span v-if="noLinks || embedded || collection !== 'creatureProperties'">
      <v-icon v-if="collection === 'creatureProperties'">
        mdi-account
      </v-icon>
      <v-icon v-else-if="collection === 'libraryNodes'">
        mdi-book-open-blank-variant
      </v-icon>
    </span>
    <a
      v-else
      data-id="breadcrumb-root"
      @click="clickRootCreature"
    >
      <v-icon color="accent">
        mdi-account
      </v-icon>
    </a>
    <template
      v-for="(prop, index) in props"
      :key="index"
    >
      <v-icon>
        mdi-chevron-right
      </v-icon>
      <span v-if="noLinks">
        <tree-node-view
          :model="prop"
          class="breadcrumb-tree-node-view"
        />
      </span>
      <a
        v-else
        :data-id="`breadcrumb-${prop._id}`"
        @click="click(prop._id)"
      >
        <tree-node-view
          :model="prop"
          class="breadcrumb-tree-node-view"
        />
      </a>
    </template>
  </div>
</template>

<style lang="css" scoped>
.breadcrumbs {
  margin-bottom: 16px;
  opacity: 0.8;
}
</style>

<style lang="css">
.no-icons .breadcrumb-tree-node-view .v-icon {
  display: none;
}
</style>
