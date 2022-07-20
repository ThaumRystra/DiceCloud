<template lang="html">
  <div class="trigger-viewer">
    <v-row dense>
      <property-field
        name="Event"
        :value="eventText"
      />
      <property-field
        v-if="(model.targetTags && model.targetTags.length) || (model.extraTags && model.extraTags.length)"
        name="Tags Required"
        :cols="{cols: 12}"
      >
        <div>
          <property-tags :tags="model.targetTags" />
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
        name="Summary"
        :model="model.summary"
      />
      <property-description
        name="Description"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<script lang="js">
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
  import { getPropertyName } from '/imports/constants/PROPERTIES.js';
  import FillSlotButton from '/imports/ui/creature/buildTree/FillSlotButton.vue';

  const eventText = {
    doActionProperty: 'Do action property',
    receiveActionProperty: 'Receiving action property',
    flipToggle: 'Toggle changed',
    adjustProperty: 'Attribute adjusted',
    anyRest: 'Short or long rest',
    longRest: 'Long rest',
    shortRest: 'Short rest',
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
      slotTypeName(){
        if (!this.model.slotType) return;
        return getPropertyName(this.model.slotType);
      },
      eventText(){
        if (!this.model.event) return;
        return eventText[this.model.event]
      },
    }
	}
</script>
