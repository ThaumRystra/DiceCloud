<template lang="html">
  <div class="slot-filler-viewer">
    <v-row dense>
      <property-field
        v-if="model.description"
        name="Description"
        :cols="{cols: 12}"
      >
        <markdown-text :markdown="model.description" />
      </property-field>
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin';
import { getPropertyName } from '/imports/constants/PROPERTIES';
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';

export default {
  components: {
    MarkdownText,
  },
  mixins: [propertyViewerMixin],
  inject: {
    context: { default: {} }
  },
  computed: {
    slotTypeName() {
      if (!this.model.slotFillerType) return;
      return getPropertyName(this.model.slotFillerType);
    },
  }
}
</script>
