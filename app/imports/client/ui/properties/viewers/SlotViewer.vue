<script setup lang="ts">
import { computed, inject } from 'vue';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import FillSlotButton from '/imports/client/ui/creature/buildTree/FillSlotButton.vue';

const props = defineProps<{ model: Record<string, any> }>();
const context = inject<any>('context', {});

const uniqueTextMap: Record<string, string> = {
  uniqueInSlot: 'Each property inside this slot should be unique',
  uniqueInCreature: 'Properties in this slot should be unique across the whole character',
};

const slotTypeName = computed(() => {
  if (!props.model.slotType) return undefined;
  return getPropertyName(props.model.slotType);
});

const uniqueText = computed(() => {
  if (!props.model.unique) return undefined;
  return uniqueTextMap[props.model.unique];
});
</script>

<template lang="html">
  <div class="slot-viewer">
    <v-row dense>
      <property-field
        name="Variable Name"
        mono
        :value="model.variableName"
      />
      <property-field
        name="Condition result"
        :value="model.slotCondition && (model.slotCondition.value || model.slotCondition.calculation)"
      />
      <property-field
        name="Fill with type"
        :value="slotTypeName"
      />
      <property-field
        name="Quantity"
        :calculation="model.quantityExpected"
      />
      <property-field
        name="Unique"
        :value="uniqueText"
      />
      <property-field
        name="Tags Required"
        :cols="{cols: 12}"
      >
        <div>
          <property-tags :tags="model.slotTags" />
          <div
            v-for="tags in model.extraTags"
            :key="tags._id"
          >
            <div class="text-caption">
              {{ tags.operation }}
            </div>
            <property-tags :tags="tags.tags" />
          </div>
        </div>
      </property-field>
      <property-description
        name="Description"
        :model="model.description"
      />
      <property-field
        v-if="context.creatureId && (!model.quantityExpected || !model.quantityExpected.value || model.spaceLeft)"
        name="Fill"
        :cols="{cols: 12}"
      >
        <fill-slot-button :model="model">
          <v-icon class="mr-1">
            mdi-plus
          </v-icon>
          Fill Slot
        </fill-slot-button>
      </property-field>
    </v-row>
  </div>
</template>
