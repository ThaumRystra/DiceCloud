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
          <v-icon left>
            mdi-plus
          </v-icon>
          Fill Slot
        </fill-slot-button>
      </property-field>
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'
import { getPropertyName } from '/imports/constants/PROPERTIES';
import FillSlotButton from '/imports/client/ui/creature/buildTree/FillSlotButton.vue';

const uniqueText = {
  uniqueInSlot: 'Each property inside this slot should be unique',
  uniqueInCreature: 'Properties in this slot should be unique across the whole character',
}

export default {
  components: {
    FillSlotButton,
  },
  mixins: [propertyViewerMixin],
  inject: {
    context: {
      default: {},
    },
  },
  computed: {
    slotTypeName() {
      if (!this.model.slotType) return;
      return getPropertyName(this.model.slotType);
    },
    uniqueText() {
      if (!this.model.unique) return;
      return uniqueText[this.model.unique]
    },
  }
}
</script>
