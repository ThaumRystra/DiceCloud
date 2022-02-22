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
        :value="model.quantityExpected && model.quantityExpected.value"
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
    </v-row>
    <property-description
      :string="model.description"
      :calculations="model.descriptionCalculations"
      :inactive="model.inactive"
    />
  </div>
</template>

<script lang="js">
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
  import { getPropertyName } from '/imports/constants/PROPERTIES.js';

  const uniqueText = {
    uniqueInSlot: 'Each property inside this slot should be unique',
    uniqueInCreature: 'Properties in this slot should be unique across the whole character',
  }

	export default {
		mixins: [propertyViewerMixin],
    computed: {
      slotTypeName(){
        if (!this.model.slotType) return;
        return getPropertyName(this.model.slotType);
      },
      uniqueText(){
        if (!this.model.unique) return;
        return uniqueText[this.model.unique]
      },
    }
	}
</script>
