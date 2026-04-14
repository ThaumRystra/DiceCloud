<template>
  <v-card
    v-if="model"
    v-bind="$attrs"
    :data-id="`slot-card-${model._id}`"
    :style="`border: solid 1px ${accentColor};`"
    hover
    class="slot-card d-flex flex-column"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @click="fillSlot"
  >
    <card-highlight :active="hover" />
    <v-card-title>
      {{ model.name }}
    </v-card-title>
    <v-card-text v-if="model.description">
      <property-description
        text
        :model="model.description"
      />
    </v-card-text>
    <v-spacer />
    <v-card-actions>
      <v-spacer />
      <v-btn
        icon
        color="accent"
        @click.stop="ignoreProp"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useStore } from 'vuex';
import { useTheme } from 'vuetify';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{ model?: Record<string, any> }>();

const theme = inject('theme', { isDark: false } as any);
const context = inject('context', {} as any);
const store = useStore(key);
const vuetifyTheme = useTheme();
const hover = ref(false);

const accentColor = computed(() => {
  if (props.model?.color) return props.model.color;
  if (theme.isDark) return vuetifyTheme.themes.value['dark']?.colors?.primary;
  return vuetifyTheme.themes.value['light']?.colors?.primary;
});

function fillSlot() {
  const slotId = props.model?._id;
  store.commit('pushDialogStack', {
    component: 'slot-fill-dialog',
    elementId: `slot-card-${slotId}`,
    data: { slotId, creatureId: context.creatureId },
    async callback(nodeIds: string[]) {
      if (!nodeIds || !nodeIds.length) return;
      try {
        await insertPropertyFromLibraryNode.callAsync({
          nodeIds,
          parentRef: { id: slotId, collection: 'creatureProperties' },
        });
      } catch (error: any) {
        console.error(error);
        snackbar({ text: error.reason || error.message || error.toString() });
      }
    },
  });
}

async function ignoreProp() {
  try {
    await updateCreatureProperty.callAsync({
      _id: props.model?._id,
      path: ['ignored'],
      value: true,
    });
  } catch (error: any) {
    console.error(error);
    snackbar({ text: error.reason || error.message || error.toString() });
  }
}
</script>
