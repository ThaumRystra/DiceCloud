<template lang="html">
  <dialog-base>
    <template #replace-toolbar="{ flat }">
      <property-toolbar
        :model="creature"
        :editing="editing"
        :flat="flat"
        :embedded="embedded"
        style="flex-grow: 0;"
        @toggle-editing="editing = !editing"
      />
    </template>
    <template v-if="_id">
      <v-fade-transition mode="out-in">
        <div v-if="editing">
          <creature-properties-tree
            style="width: 100%;"
            class="mb-2"
            organize
            :root="{ collection: 'creatures', id: _id }"
            @length="childrenLength = $event"
            @selected="selectSubProperty"
          />
          <v-btn
            icon
            variant="outlined"
            color="accent"
            data-id="insert-creature-property-btn"
            @click="addProperty"
          >
            <v-icon>
              mdi-plus
            </v-icon>
          </v-btn>
        </div>
        <div v-else>
          <creature-properties-tree
            style="width: 100%;"
            :root="{ collection: 'creatures', id: _id }"
            @length="childrenLength = $event"
            @selected="selectSubProperty"
          />
        </div>
      </v-fade-transition>
    </template>
    <template
      v-if="!embedded"
      #actions
    >
      <div class="layout">
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

<script setup lang="ts">
import { ref, computed, watch, provide, reactive, nextTick } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import Creatures from '/imports/api/creature/creatures/Creatures';
import PropertyToolbar from '/imports/client/ui/components/propertyToolbar.vue';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import propertyFormIndex from '/imports/client/ui/properties/forms/shared/propertyFormIndex';
import propertyViewerIndex from '/imports/client/ui/properties/viewers/shared/propertyViewerIndex';
import CreaturePropertiesTree from '/imports/client/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import insertProperty from '/imports/api/creature/creatureProperties/methods/insertProperty';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import { key } from '/imports/client/ui/vuexStore';

const props = withDefaults(defineProps<{
  _id?: string;
  embedded?: boolean;
  startInEditTab?: boolean;
}>(), {
  _id: undefined,
  embedded: false,
  startInEditTab: false,
});

const store = useStore(key);

const editing = ref(!!props.startInEditTab);
const currentId = ref<string | undefined>(undefined);
const childrenLength = ref(0);

watch(() => props._id, async (newId) => {
  await nextTick();
  currentId.value = newId;
}, { immediate: true });

const creature = computed(() => Creatures.findOne(props._id));

const { result: editPermission } = autorun(() => {
  try {
    assertEditPermission(creature.value, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
});

provide('context', reactive({ creatureId: props._id, editPermission }));

function selectSubProperty(_id: string) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: `tree-node-${_id}`,
    data: {
      _id,
      startInEditTab: editing.value,
    },
  });
}

function addProperty() {
  const parentPropertyId = props._id;
  store.commit('pushDialogStack', {
    component: 'insert-property-dialog',
    elementId: 'insert-creature-property-btn',
    data: {
      parentDoc: creature.value,
      creatureId: props._id,
      noBackdropClose: true,
    },
    async callback(result: any) {
      if (!result) return;
      const parentRef = {
        id: parentPropertyId,
        collection: 'creatures',
      };
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

<style lang="css" scoped></style>
