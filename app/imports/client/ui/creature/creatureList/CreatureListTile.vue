<script setup lang="ts">
import { ref } from 'vue';
import SharedIcon from '/imports/client/ui/components/SharedIcon.vue';
import { VueDraggable } from 'vue-draggable-plus';
import { moveBetweenRoots } from '../../../../api/creature/creatureProperties/methods/organizeProperty';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';

const props = defineProps<{
  model: Record<string, any>;
  selection?: boolean;
  isSelected?: boolean;
  dense?: boolean;
}>();

const dataItems = ref<any[]>([]);
const dragover = ref(false);

async function dropItem(event: any) {
  const item = event.data;
  if (!item?._id) return;
  const docRef = { collection: 'creatureProperties', id: item._id };
  const oldRoot = item.root;
  const oldOrder = item.left;
  const undo = async () => {
    try {
      await moveBetweenRoots.callAsync({
        docRef,
        newRootRef: oldRoot,
        newPosition: (oldOrder || 1) - 0.5,
        skipClient: true,
      });
    } catch (e: any) {
      console.error(e);
      snackbar({ text: e.reason || e.message || e.toString() });
    }
  };
  try {
    await moveBetweenRoots.callAsync({
      docRef,
      newRootRef: { collection: 'creatures', id: props.model._id },
      newPosition: 0.5,
    });
    snackbar({
      text: `Moved ${item.name || 'item'} to ${props.model.name || 'another character'}`,
      callbackName: 'undo',
      callback: undo,
    });
  } catch (e: any) {
    console.error(e);
    snackbar({ text: e.reason || e.message || e.toString() });
  }
}
</script>

<template
  lang="html"
>
  <VueDraggable
    v-model="dataItems"
    :group="'item-list'"
    :sort="false"
    ghost-class="item-to-creature-ghost"
    draggable=".no-real-items"
    style="position: relative;"
    @add="dropItem"
  >
    <v-list-item
      v-bind="$attrs"
      :class="{
        'text-primary v-list-item--active': isSelected,
        'item-to-creature-drag-over': dragover,
      }"
      :density="dense ? 'compact' : 'default'"
      v-on="selection ? { click() {$emit('click')} } : {}"
    >
      <template #prepend>
        <v-avatar
          :color="isSelected ? 'red darken-1' : model.color || 'grey'"
          :size="dense ? 30 : undefined"
          class="text-white"
          style="transition: background 0.3s;"
        >
          <v-fade-transition leave-absolute>
            <v-icon v-if="isSelected">
              mdi-check
            </v-icon>
            <img
              v-else-if="model.avatarPicture"
              :src="model.avatarPicture"
              :alt="model.name"
            >
            <template v-else>
              <span>
                {{ model.initial }}
              </span>
            </template>
          </v-fade-transition>
        </v-avatar>
      </template>
      <v-list-item-title>
        {{ model.name }}
      </v-list-item-title>
      <v-list-item-subtitle v-if="!dense">
        {{ model.alignment }} {{ model.gender }} {{ model.race }}
      </v-list-item-subtitle>
      <template #append>
        <shared-icon
          v-if="!dense"
          :model="model"
        />
        <drag-handle
          v-if="!selection && !dense"
          style="height: 100%; width: 40px;"
        />
      </template>
    </v-list-item>
  </VueDraggable>
</template>

<style lang="css">
  .item-to-creature-ghost {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    right: 0;
  }
  .item-to-creature-ghost .v-btn {
    display: none;
  }
</style>
