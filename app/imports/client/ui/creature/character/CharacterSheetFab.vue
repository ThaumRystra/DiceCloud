<template lang="html">
  <div
    v-bind="$attrs"
    class="v-speed-dial"
    :style="!speedDials ? 'visibility: hidden;' : ''"
    style="position: relative;"
  >
    <v-btn
      color="primary"
      icon
      size="small"
      data-id="insert-creature-property-fab"
      class="insert-creature-property-fab"
      @click="fab = !fab"
    >
      <v-icon
        style="transition: transform 0.2s ease-in-out"
        :style="fab && 'transform: rotate(45deg)'"
      >
        mdi-plus
      </v-icon>
    </v-btn>
    <div
      v-show="fab"
      class="v-speed-dial__list"
    >
      <labeled-fab
        v-for="type in speedDials"
        :key="type"
        color="primary"
        :data-id="`insert-creature-property-type-${type}`"
        :label="getPropertyLabel(type)"
        :icon="type ? properties[type].icon : 'mdi-plus'"
        :disabled="!editPermission"
        @click="addProperty(type)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { autorun } from 'vue-meteor-tracker';
import LabeledFab from '/imports/client/ui/components/LabeledFab.vue';
import insertProperty from '/imports/api/creature/creatureProperties/methods/insertProperty';
import Creatures from '/imports/api/creature/creatures/Creatures';
import PROPERTIES from '/imports/constants/PROPERTIES';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import { fetchDocByRef } from '/imports/api/parenting/parentingFunctions';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{ editPermission?: boolean }>();
const store = useStore(key);
const route = useRoute();

const fab = ref(false);

const creatureId = computed(() => route.params.id as string);
const tabName = computed(() => store.getters.tabNameById(creatureId.value));
const speedDialsByTab = {
  'stats': ['attribute', 'skill', 'buff'],
  'features': ['feature'],
  'spells': ['spellList', 'spell'],
  'actions': ['action'],
  'inventory': ['item', 'container'],
  'journal': ['note'],
  'tree': [null],
} as Record<string, (string | null)[]>;
const speedDials = computed(() => speedDialsByTab[tabName.value]);
const properties = PROPERTIES;

function getPropertyLabel(type: string | null) {
  if (type === 'buff') return 'Buff or Condition';
  return type ? PROPERTIES[type].name : 'Property';
}

function getParentFromSelectedTreeNode(cId: string) {
  const el = document.querySelector('.tree-tab .tree-node-title.text-primary');
  const selectedComponent = el && (el.parentElement as any).__vue__?.$parent;
  const onTreeTab = store.getters.tabNameById(cId) === 'tree';
  if (onTreeTab && selectedComponent) {
    if (selectedComponent.showExpanded) {
      return { id: selectedComponent.node._id, collection: 'creatureProperties' };
    } else {
      return selectedComponent.node.parent;
    }
  }
  return { collection: 'creatures', id: cId };
}

function hideFab() {
  const el = document.querySelector('.insert-creature-property-fab') as HTMLElement | null;
  if (el) el.style.opacity = '0';
  return el;
}

function revealFab(el: HTMLElement | null) {
  if (!el) return;
  el.style.transition = 'none';
  el.style.opacity = '';
  el.style.transform = 'scale(0)';
  setTimeout(() => {
    el.style.transform = '';
    el.style.transition = '';
  }, 400);
}

function addProperty(forcedType: string | null) {
  const cId = creatureId.value;
  const el = hideFab();
  const parentRef = getParentFromSelectedTreeNode(cId);
  let parent: any;
  try {
    parent = fetchDocByRef(parentRef);
  } catch (e) {
    console.warn(e);
  }
  store.commit('pushDialogStack', {
    component: 'insert-property-dialog',
    elementId: 'insert-creature-property-type-' + forcedType,
    data: {
      parentDoc: forcedType ? undefined : parent,
      forcedType,
      creatureId: cId,
      noBackdropClose: true,
    },
    async callback(result: any) {
      if (!result) {
        return 'insert-creature-property-fab';
      }
      if (Array.isArray(result)) {
        revealFab(el);
        const nodeIds = result;
        const id = await insertPropertyFromLibraryNode.callAsync({ nodeIds, parentRef });
        return forcedType ? id : `tree-node-${id}`;
      } else {
        revealFab(el);
        const creatureProperty = result;
        const id = await insertProperty.callAsync({ creatureProperty, parentRef });
        return forcedType ? id : `tree-node-${id}`;
      }
    },
  });
}
</script>

<style lang="css" scoped>
.insert-creature-property-fab {
  transition: transform 0.07s cubic-bezier(0.5, 0.2, 0.8, 0.4) 0s;
}
</style>
