<template>
  <div class="choice-input">
    <v-expansion-panels
      accordion
      tile
      multiple
      hover
    >
      <v-expansion-panel
        v-for="prop in choices"
        :key="prop._id"
        :model="prop"
        :data-id="prop._id"
      >
        <v-expansion-panel-header>
          <template #default="{ open }">
            <v-checkbox
              v-model="selectedItems"
              class="my-0 py-0 mr-2 flex-grow-0"
              hide-details
              :value="prop._id"
              :disabled="!selectedItems.includes(prop._id) && selectedItems.length >= quantity.max"
              @click.stop
            />
            <tree-node-view :model="prop" />
            <template v-if="open">
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
        </v-expansion-panel-header>
        <v-expansion-panel-content class="py-4">
          <property-viewer :model="prop" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-btn
      :disabled="!canContinue"
      @click="$emit('continue');"
    >
      Done
    </v-btn>
  </div>
</template>

<script lang="js">
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import PropertyViewer from '/imports/client/ui/properties/shared/PropertyViewer.vue';

export default {
  components: {
    TreeNodeView,
    PropertyViewer,
  },
  props: {
    choices: {
      type: Array,
      required: true
    },
    quantity: {
      type: Object,
      default: () => ({min: 0, max: 1}),
    },
  },
  data() {
    return {
      selectedItems: [],
    };
  },
  computed: {
    canContinue() {
      return this.selectedItems.length >= this.quantity.min;
    }
  },
  watch: {
    selectedItems(val) {
      this.$emit('input', val)
    },
  },
};
</script>