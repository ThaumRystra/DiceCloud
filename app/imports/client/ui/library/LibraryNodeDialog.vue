<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, provide } from 'vue';
import { useStore } from 'vuex';
import { autorun, subscribe } from 'vue-meteor-tracker';
import LibraryNodes, {
  pushToLibraryNode,
  pullFromLibraryNode,
  softRemoveLibraryNode,
  restoreLibraryNode,
} from '/imports/api/library/LibraryNodes';
import { insertLibraryNode } from '/imports/api/library/methods/insertLibraryNode';
import { updateLibraryNode } from '/imports/api/library/methods/updateLibraryNode';
import duplicateLibraryNode from '/imports/api/library/methods/duplicateLibraryNode';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import PropertyToolbar from '/imports/client/ui/components/propertyToolbar.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import { get } from 'lodash';
import {
  assertDocEditPermission, assertDocCopyPermission
} from '/imports/api/sharing/sharingPermissions';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';
import copyLibraryNodeTo from '/imports/api/library/methods/copyLibraryNodeTo';
import { getUserTierAsync } from '/imports/api/users/patreon/tiers';
import PropertyForm from '/imports/client/ui/properties/PropertyForm.vue';
import PropertyViewer from '/imports/client/ui/properties/shared/PropertyViewer.vue';
import Breadcrumbs from '/imports/client/ui/creature/creatureProperties/Breadcrumbs.vue';
import { key } from '/imports/client/ui/vuexStore';
import errorToString from '/imports/api/utility/errorToString';

const props = defineProps<{
  _id: string;
  startInEditTab?: boolean;
  embedded?: boolean;
  selection?: boolean;
}>();

const emit = defineEmits(['duplicated', 'removed', 'select-sub-property']);
const store = useStore(key);

const editing = ref(!!props.startInEditTab);
// currentId lags behind _id by one tick so that events fired by destroying
// forms keyed to the old ID are applied before the new ID overwrites it
const currentId = ref<string | undefined>(undefined);
const isLibraryForm = true;

watch(() => props._id, (newId) => {
  nextTick(() => {
    currentId.value = newId;
  });
}, { immediate: true });

const { ready } = subscribe(() => ['libraryNode', props._id]);

const { result: model } = autorun(() => {
  return LibraryNodes.findOne(currentId.value);
});

const { result: editPermission } = autorun(() => {
  try {
    assertDocEditPermission(model.value, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
});

const { result: copyPermission } = autorun(() => {
  try {
    assertDocCopyPermission(model.value, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
});

provide('context', reactive({
  editPermission,
  copyPermission,
  isLibraryForm,
}));

const typeName = computed(() => {
  if (!model.value) return;
  return getPropertyName(model.value.type);
});

async function duplicate() {
  try {
    const duplicateId = await duplicateLibraryNode.callAsync({ _id: currentId.value });
    if (props.embedded) {
      emit('duplicated', duplicateId);
    } else {
      store.dispatch('popDialogStack');
    }
  } catch (error) {
    console.error(error);
  }
}

async function makeReference() {
  if (!model.value) {
    console.error('Expected model to exist before calling makeReference');
    return;
  }
  try {
    const docId = await insertLibraryNode.callAsync({
      libraryNode: {
        type: 'reference',
        ref: {
          collection: 'libraryNodes',
          id: model.value._id,
        },
      },
      parentId: model.value.parentId,
    });
    if (props.embedded) {
      emit('duplicated', docId);
    } else {
      await store.dispatch('popDialogStack');
    }
  } catch (error) {
    console.error(error);
  }
}

function selectSubProperty(_id: string) {
  if (props.embedded) {
    emit('select-sub-property', _id);
    return;
  }
  store.commit('pushDialogStack', {
    component: 'library-node-dialog',
    elementId: `tree-node-${_id}`,
    data: {
      _id,
      startInEditTab: editing.value,
    },
  });
}

function move() {
  const id = props._id;
  store.commit('pushDialogStack', {
    component: 'move-library-node-dialog',
    elementId: 'property-toolbar-menu-button',
    async callback(parentId: string) {
      if (!parentId) return;
      try {
        await organizeDoc.callAsync({
          docRef: { collection: 'libraryNodes', id },
          parentRef: { collection: 'libraryNodes', id: parentId },
        });
      } catch (error) {
        console.error(error);
      }
    },
  });
}

function copy() {
  const thisId = props._id;
  store.commit('pushDialogStack', {
    component: 'move-library-node-dialog',
    elementId: 'property-toolbar-menu-button',
    data: { action: 'Copy' },
    async callback(parentId: string) {
      if (!parentId) return;
      try {
        await copyLibraryNodeTo.callAsync({
          _id: thisId,
          parent: { collection: 'libraryNodes', id: parentId },
        });
        snackbar({ text: 'Copied successfully' });
      } catch (error) {
        console.error(error);
        snackbar({ text: errorToString(error) });
      }
    },
  });
}

async function change({ path, value, ack }: { path: string[]; value: any; ack?: Function }) {
  try {
    if (!currentId.value) {
      ack?.();
      return;
    }
    await updateLibraryNode.callAsync({ _id: currentId.value, path, value });
    ack?.();
  } catch (error: unknown) {
    ack?.(errorToString(error));
    console.error(error);
  }
}

async function push({ path, value, ack }: { path: string[]; value: any; ack?: Function }) {
  try {
    await pushToLibraryNode.callAsync({ _id: currentId.value, path, value });
    if (ack) ack();
  } catch (error: any) {
    if (ack) ack(error.reason || error);
    else console.error(error);
  }
}

async function pull({ path, ack }: { path: string[]; ack?: Function }) {
  const itemId = get(model.value, path)._id;
  path.pop();
  try {
    await pullFromLibraryNode.callAsync({ _id: currentId.value, path, itemId });
    if (ack) ack();
  } catch (error: any) {
    if (ack) ack(error.reason || error);
    else console.error(error);
  }
}

function addLibraryNode({ elementId, suggestedType }: { elementId: string; suggestedType?: string }) {
  const tier = getUserTierAsync(Meteor.userId());
  if (!(tier && tier.paidBenefits)) {
    store.commit('pushDialogStack', {
      component: 'tier-too-low-dialog',
      elementId,
    });
    return;
  }
  if (!model.value) {
    console.error('Expected model to exist before calling addLibraryNode');
    return;
  }
  const parentPropertyId = model.value._id;
  store.commit('pushDialogStack', {
    component: 'insert-property-dialog',
    elementId,
    data: {
      parentDoc: model.value,
      hideLibraryTab: true,
      suggestedType,
      noBackdropClose: true,
      showLibraryOnlyProps: true,
      collection: 'libraryNodes',
    },
    async callback(result: any) {
      if (!result) return;
      const parentRef = { id: parentPropertyId, collection: 'libraryNodes' };
      const libraryNode = result;
      const id = await insertNode.callAsync({ libraryNode, parentRef });
      return `tree-node-${id}`;
    },
  });
}

function remove() {
  const _id = currentId.value;
  softRemoveLibraryNode.callAsync({ _id });
  if (props.embedded) {
    emit('removed');
  } else {
    store.dispatch('popDialogStack');
  }
  snackbar({
    text: `Deleted ${getPropertyTitle(model.value)}`,
    callbackName: 'undo',
    callback() {
      restoreLibraryNode.callAsync({ _id });
    },
  });
}
</script>

<template lang="html">
  <dialog-base>
    <template #replace-toolbar="{ flat }">
      <property-toolbar
        :model="model"
        :editing="editing"
        :flat="flat"
        :embedded="embedded"
        @duplicate="duplicate"
        @move="move"
        @copy="copy"
        @remove="remove"
        @make-reference="makeReference"
        @toggle-editing="editing = !editing"
        @color-changed="value => change({ path: ['color'], value })"
      />
    </template>
    <v-fade-transition>
      <div
        v-if="model"
        class="d-flex mb-4"
      >
        <breadcrumbs
          :model="model"
          :editing="editing"
          :embedded="embedded"
          collection="libraryNodes"
          @select-sub-property="selectSubProperty"
        />
        <v-spacer />
        <v-chip disabled>
          {{ typeName }}
        </v-chip>
      </div>
    </v-fade-transition>
    <v-fade-transition mode="out-in">
      <div v-if="!_id" />
      <div
        v-else-if="!ready"
        class="fill-height layout justify-center align-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
      </div>
      <property-form
        v-else-if="model && editing"
        :key="_id + '-editing'"
        class="library-node-form"
        collection="libraryNodes"
        :model="model"
        :embedded="embedded"
        @change="change"
        @push="push"
        @pull="pull"
        @add-child="addLibraryNode"
        @select-sub-property="selectSubProperty"
      />
      <property-viewer
        v-else-if="model + '-viewing'"
        :key="_id"
        :model="model"
        collection="libraryNodes"
        @select-sub-property="selectSubProperty"
      />
    </v-fade-transition>
    <template
      v-if="!embedded"
      #actions
    >
      <div class="d-flex justify-end">
        <template v-if="selection">
          <v-btn
            variant="text"
            @click="store.dispatch('popDialogStack', false)"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            variant="text"
            @click="store.dispatch('popDialogStack', true)"
          >
            Select
          </v-btn>
        </template>
        <v-btn
          v-else
          variant="text"
          @click="store.dispatch('popDialogStack')"
        >
          Done
        </v-btn>
      </div>
    </template>
  </dialog-base>
</template>

<style lang="css" scoped></style>
