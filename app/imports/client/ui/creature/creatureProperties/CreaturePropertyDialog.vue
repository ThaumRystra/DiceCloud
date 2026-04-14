<script setup lang="ts">
import { ref, computed, watch, reactive, provide, nextTick } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import { Meteor } from 'meteor/meteor';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import pushToProperty from '/imports/api/creature/creatureProperties/methods/pushToProperty';
import pullFromProperty from '/imports/api/creature/creatureProperties/methods/pullFromProperty';
import softRemoveProperty from '/imports/api/creature/creatureProperties/methods/softRemoveProperty';
import restoreProperty from '/imports/api/creature/creatureProperties/methods/restoreProperty';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';
import duplicateProperty from '/imports/api/creature/creatureProperties/methods/duplicateProperty';
import Creatures from '/imports/api/creature/creatures/Creatures';
import PropertyToolbar from '/imports/client/ui/components/propertyToolbar.vue';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import PropertyForm from '/imports/client/ui/properties/PropertyForm.vue';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import { get } from 'lodash';
import equipItem from '/imports/api/creature/creatureProperties/methods/equipItem';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import insertProperty from '/imports/api/creature/creatureProperties/methods/insertProperty';
import Breadcrumbs from '/imports/client/ui/creature/creatureProperties/Breadcrumbs.vue';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import PropertyViewer from '/imports/client/ui/properties/shared/PropertyViewer.vue';
import copyPropertyToLibrary from '/imports/api/creature/creatureProperties/methods/copyPropertyToLibrary';
import doAction from '/imports/client/ui/creature/actions/doAction';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  _id?: string;
  embedded?: boolean;
  startInEditTab?: boolean;
}>();

const emit = defineEmits<{
  (e: 'duplicated', id: string): void;
  (e: 'removed'): void;
  (e: 'select-sub-property', id: string): void;
}>();

const store = useStore(key);
const editing = ref(!!props.startInEditTab);
const currentId = ref<string | undefined>(undefined);

watch(() => props._id, async (newId) => {
  await nextTick();
  currentId.value = newId;
}, { immediate: true });

const { result: model } = autorun(() =>
  CreatureProperties.findOne(currentId.value)
);

const creature = computed(() => {
  if (!model.value) return undefined;
  return Creatures.findOne((model.value as any).root.id);
});

const creatureId = computed(() => (creature.value as any)?._id);

const { result: editPermission } = autorun(() => {
  if (!creature.value) return false;
  try {
    assertEditPermission(creature.value as any, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
});

const typeName = computed(() => {
  if (!model.value) return undefined;
  return getPropertyName((model.value as any).type);
});

provide('context', reactive({ creatureId, editPermission }));

async function duplicate() {
  try {
    const id = await duplicateProperty.callAsync({ _id: currentId.value });
    if (props.embedded) {
      emit('duplicated', id);
    } else {
      store.dispatch('popDialogStack');
    }
  } catch (error) {
    console.error(error);
  }
}

async function change({ path, value, ack }: any) {
  try {
    if (path && path[0] === 'equipped') {
      await equipItem.callAsync({ _id: currentId.value, equipped: value });
    } else {
      await updateCreatureProperty.callAsync({ _id: currentId.value, path, value });
    }
    if (ack) ack();
  } catch (error: any) {
    if (ack) ack(error.reason || error.message || error);
    else console.error(error);
  }
}

async function damage({ operation, value, ack }: any) {
  const m = model.value as any;
  try {
    await doAction({
      creatureId: m.root.id,
      $store: store,
      elementId: '??',
      task: {
        subtaskFn: 'damageProp',
        prop: m,
        targetIds: [m.root.id],
        params: {
          title: getPropertyTitle(m),
          operation,
          value,
          targetProp: m,
        },
      },
    });
    ack?.();
  } catch (error: any) {
    if (ack) ack(error);
    else {
      snackbar({ text: error.reason || error.message || error.toString() });
      console.error(error);
    }
  }
}

async function push({ path, value, ack }: any) {
  try {
    await pushToProperty.callAsync({ _id: currentId.value, path, value });
    if (ack) ack();
  } catch (error: any) {
    if (ack) ack(error.reason || error.message || error);
    else console.error(error);
  }
}

async function pull({ path, ack }: any) {
  const itemId = get(model.value, path)._id;
  path.pop();
  try {
    await pullFromProperty.callAsync({ _id: currentId.value, path, itemId });
    if (ack) ack();
  } catch (error: any) {
    if (ack) ack(error.reason || error.message || error);
    else console.error(error);
  }
}

function remove() {
  const _id = currentId.value;
  softRemoveProperty.callAsync({ _id });
  if (props.embedded) {
    emit('removed');
  } else {
    store.dispatch('popDialogStack');
  }
  snackbar({
    text: `Deleted ${getPropertyTitle(model.value as any)}`,
    callbackName: 'undo',
    callback() {
      restoreProperty.callAsync({ _id });
    },
  });
}

function selectSubProperty(_id: string) {
  if (props.embedded) {
    emit('select-sub-property', _id);
    return;
  }
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `tree-node-${_id}`,
    data: { _id, startInEditTab: editing.value },
  });
}

function copyToLibrary() {
  const thisId = props._id;
  store.commit('pushDialogStack', {
    component: 'move-library-node-dialog',
    elementId: 'property-toolbar-menu-button',
    data: { action: 'Copy' },
    async callback(parentId: string) {
      if (!parentId) return;
      try {
        await copyPropertyToLibrary.callAsync({
          propId: thisId,
          parentRef: { collection: 'libraryNodes', id: parentId },
        });
        snackbar({ text: 'Copied successfully' });
      } catch (error: any) {
        console.error(error);
        snackbar({ text: error.reason || error.message || error.toString() });
      }
    },
  });
}

function addProperty({ elementId, suggestedType }: any) {
  const parentPropertyId = (model.value as any)._id;
  store.commit('pushDialogStack', {
    component: 'insert-property-dialog',
    elementId,
    data: {
      parentDoc: model.value,
      creatureId: creatureId.value,
      suggestedType,
      noBackdropClose: true,
    },
    async callback(result: any) {
      if (!result) return;
      const parentRef = { id: parentPropertyId, collection: 'creatureProperties' };
      if (Array.isArray(result)) {
        const nodeIds = result;
        const id = await insertPropertyFromLibraryNode.callAsync({ nodeIds, parentRef });
        return `tree-node-${id}`;
      } else {
        const creatureProperty = result;
        const id = await insertProperty.callAsync({ creatureProperty, parentRef });
        return `tree-node-${id}`;
      }
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
        style="flex-grow: 0;"
        @duplicate="duplicate"
        @remove="remove"
        @copy-to-library="copyToLibrary"
        @toggle-editing="editing = !editing"
      />
    </template>
    <template v-if="model">
      <div class="d-flex mb-4">
        <breadcrumbs
          :model="model"
          :editing="editing"
          :embedded="embedded"
          @select-sub-property="selectSubProperty"
        />
        <v-spacer />
        <v-chip disabled>
          {{ typeName }}
        </v-chip>
      </div>
      <v-fade-transition mode="out-in">
        <div v-if="editing">
          <property-form
            :key="_id"
            class="creature-property-form"
            :model="model"
            :embedded="embedded"
            @change="change"
            @push="push"
            @pull="pull"
            @add-child="addProperty"
            @select-sub-property="selectSubProperty"
          />
        </div>
        <property-viewer
          v-else
          :key="_id"
          :model="model"
          @select-sub-property="selectSubProperty"
          @remove="remove"
          @change="change"
        />
      </v-fade-transition>
    </template>
    <template #actions>
      <div
        v-if="!embedded"
        class="layout"
      >
        <v-spacer />
        <v-btn
          variant="text"
          color="accent"
          @click="$store.dispatch('popDialogStack')"
        >
          Close
        </v-btn>
      </div>
    </template>
  </dialog-base>
</template>

<style lang="css" scoped></style>
