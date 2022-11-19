<template lang="html">
  <div class="proficiency-viewer">
    <v-row dense>
      <property-field
        v-if="model.value !== undefined"
        name="Proficiency"
      >
        <proficiency-icon
          :value="model.value"
          style="height: 12px"
          class="ml-1 mr-2"
        />
        <div>
          {{ proficiencyText }}
        </div>
      </property-field>
      <property-field
        name="Stats"
        :value="model.stats && model.stats.join(', ')"
        mono
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin.js';
import ProficiencyIcon from '/imports/client/ui/properties/shared/ProficiencyIcon.vue';

export default {
  components: {
    ProficiencyIcon,
  },
  mixins: [propertyViewerMixin],
  computed: {
    proficiencyText(){
      switch (this.model.value){
        case 0.49: return 'Half proficiency bonus rounded down';
        case 0.5: return 'Half proficiency bonus';
        case 1: return 'Proficient';
        case 2: return 'Double proficiency bonus';
        default: return '';
      }
    }
  }
}
</script>
