<template lang="html">
  <v-sheet
    class="tree-node"
    :class="{
      'empty': !hasChildren,
    }"
    :data-id="`tree-node-${doc._id}`"
  >
    <div
      class="d-flex align-center justify-start tree-node-title"
      style="cursor: pointer;"
      @click.stop="$emit('selected', doc._id)"
    >
      <v-btn
        size="small"
        icon
        class="expand-button"
        :class="{
          'rotate-90': showExpanded,
          'text-accent': doc._descendantCanFill || canFillWithMany
        }"
        :disabled="!canExpand"
        @click.stop="expanded = !expanded"
      >
        <v-icon v-if="canExpand">
          mdi-chevron-right
        </v-icon>
      </v-btn>
      <div
        class="d-flex align-center justify-start pr-1"
      >
        <!--{{doc && doc.order}}-->
        <div
          v-if="isSlot"
          class="text-truncate"
        >
          <span
            :class="{
              'text-secondary': !canFill,
              'text-accent': canFill,
            }"
          >
            {{ doc.name }}
          </span>
          <fill-slot-button
            v-if="canFillWithOne"
            :model="doc"
          />
        </div>
        <template
          v-else
        >
          <tree-node-view
            :model="doc"
          />
          <v-spacer />
          <v-btn
            v-if="doc.parentId === parentSlotId"
            icon
            :disabled="context.editPermission === false"
            @click.stop="remove(doc)"
          >
            <v-icon>
              mdi-delete
            </v-icon>
          </v-btn>
        </template>
        <template v-if="condenseChild">
          <span class="mr-4">:</span>
          <tree-node-view
            :model="children[0].doc"
          />
          <v-spacer />
          <v-btn
            icon
            :disabled="context.editPermission === false"
            @click.stop="remove(children[0].doc)"
          >
            <v-icon>
              mdi-delete
            </v-icon>
          </v-btn>
        </template>
      </div>
    </div>
    <v-expand-transition>
      <div
        v-show="showExpanded"
        class="ml-3 expand-area"
      >
        <v-fade-transition hide-on-leave>
          <build-tree-node-list
            v-if="showExpanded"
            :children="computedChildren"
            :parent-slot-id="computedSlotId"
            :depth="depth"
            @selected="e => $emit('selected', e)"
          />
          <div v-else>
            <div
              v-for="i in computedChildren.length"
              :key="i"
              class="dummy-node"
            />
          </div>
        </v-fade-transition>
        <div
          v-if="canFillWithMany"
        >
          <fill-slot-button
            class="ml-5"
            :model="doc"
          />
        </div>
      </div>
    </v-expand-transition>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent, inject } from 'vue';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import FillSlotButton from '/imports/client/ui/creature/buildTree/FillSlotButton.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import softRemoveProperty from '/imports/api/creature/creatureProperties/methods/softRemoveProperty';
import restoreProperty from '/imports/api/creature/creatureProperties/methods/restoreProperty';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';

// Lazy import to break circular dependency
const BuildTreeNodeList = defineAsyncComponent(() =>
  import('/imports/client/ui/creature/buildTree/BuildTreeNodeList.vue')
);

const props = withDefaults(defineProps<{
  depth?: number;
  doc: Record<string, any>;
  children?: any[];
  parentSlotId?: string;
}>(), {
  depth: 0,
  children: () => [],
  parentSlotId: undefined,
});

const context = inject('context', {} as any);

const expanded = ref(props.depth <= 2);

const condenseChild = computed(() =>
  props.doc.type === 'propertySlot' &&
  props.children.length === 1 &&
  props.children[0].doc.type !== 'propertySlot' &&
  props.doc.quantityExpected &&
  props.doc.quantityExpected.value === 1 &&
  !canFill.value
);

const isSlot = computed(() => props.doc.type === 'propertySlot');
const canFill = computed(() => !!props.doc._canFill);

const canFillWithOne = computed(() =>
  isSlot.value &&
  canFill.value &&
  props.doc.quantityExpected &&
  props.doc.quantityExpected.value === 1 &&
  props.doc.spaceLeft === 1 &&
  !props.children?.length
);

const canFillWithMany = computed(() =>
  isSlot.value && canFill.value && (
    !props.doc.quantityExpected ||
    props.doc.quantityExpected.value === 0 ||
    (props.doc.quantityExpected.value > 1 && props.doc.spaceLeft > 0) ||
    (props.doc.quantityExpected.value === 1 && props.children?.length)
  )
);

const computedChildren = computed(() => {
  if (condenseChild.value) {
    return props.children[0].children;
  }
  return props.children;
});

const hasChildren = computed(() =>
  !!props.children && !!computedChildren.value.length
);

const showExpanded = computed(() => canExpand.value && expanded.value);

const computedSlotId = computed(() => {
  if (condenseChild.value) {
    if (props.children[0].doc.type === 'propertySlot') {
      return props.children[0].doc._id;
    } else {
      return undefined;
    }
  } else {
    if (props.doc.type === 'propertySlot') {
      return props.doc._id;
    } else {
      return undefined;
    }
  }
});

const canExpand = computed(() => !!computedChildren.value.length || canFillWithMany.value);

watch(() => props.doc._ancestorOfMatchedDocument, (value) => {
  expanded.value = !!value;
});

function remove(model: Record<string, any>) {
  const _id = model._id;
  softRemoveProperty.callAsync({ _id });
  snackbar({
    text: `Deleted ${getPropertyTitle(model)}`,
    callbackName: 'undo',
    callback() {
      restoreProperty.callAsync({ _id });
    },
  });
}
</script>

<style lang="css" scoped>
  .rotate-90 {
    transform: rotate(90deg) translateZ(0);
  }
  .expand-area {
    box-shadow: -2px 0px 0px 0px #808080;
    margin-left: 0;
  }
  .handle {
    cursor: move;
  }
  .empty .drag-area {
    box-shadow: -2px 0px 0px 0px rgb(128, 128, 128, 0.4);
  }
  .empty .expand-button {
    opacity: 0.4;
  }
  .found {
    background: rgba(200, 0, 0, 0.1) !important;
  }
  .ghost {
    opacity: 0.5;
    background: rgba(251, 0, 0, 0.3);
  }
  .v-icon.v-icon--disabled {
    opacity: 0;
  }
  .v-icon {
    transition: none !important;
  }
  .v-theme--light .tree-node-title:hover {
    background-color: rgba(0,0,0,.04);
  }
  .v-theme--dark .tree-node-title:hover {
    background-color: rgba(255,255,255,.04);
  }
  .tree-node-title{
    transition: background ease 0.3s, color ease 0.15s;
  }
  .tree-node-title, .dummy-node {
    height: 40px;
  }
</style>
