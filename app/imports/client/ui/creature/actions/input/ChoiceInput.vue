<template>
  <div class="choice-input">
    <v-expansion-panels
      accordion
      rounded="0"
      multiple
      hover
    >
      <v-expansion-panel
        v-for="prop in choices"
        :key="prop._id"
        :model="prop"
        :data-id="prop._id"
      >
        <v-expansion-panel-title>
          <template #default="{ expanded }">
            <v-checkbox
              v-model="selectedItems"
              class="my-0 py-0 mr-2 flex-grow-0"
              hide-details
              :value="prop._id"
              :disabled="!selectedItems.includes(prop._id) && selectedItems.length >= quantity.max"
              @click.stop
            />
            <tree-node-view :model="prop" />
            <template v-if="expanded">
              <v-spacer />
              <v-btn
                icon
                class="flex-grow-0"
                @click.stop="openPropertyDetails(prop._id)"
              >
                <v-icon>mdi-window-restore</v-icon>
              </v-btn>
            </template>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="py-4">
          <property-viewer :model="prop" />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-btn
      :disabled="!canContinue"
      @click="emit('continue');"
    >
      Done
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import PropertyViewer from '/imports/client/ui/properties/shared/PropertyViewer.vue';
import { useStore } from 'vuex';
import { key } from '/imports/client/ui/vuexStore';

const store = useStore(key);

const props = withDefaults(defineProps<{
  choices: any[];
  quantity?: { min: number; max: number };
}>(), {
  quantity: () => ({ min: 0, max: 1 }),
});

const emit = defineEmits<{
  input: any;
  continue: [];
}>();

const selectedItems = ref<any[]>([]);

const canContinue = computed(() => selectedItems.value.length >= props.quantity.min);

watch(selectedItems, (val) => {
  emit('input', val);
});

function openPropertyDetails(id: string) {
  store.commit('pushDialogStack', {
    component: 'creature-property-dialog',
    elementId: id,
    data: { _id: id },
  });
}
</script>
