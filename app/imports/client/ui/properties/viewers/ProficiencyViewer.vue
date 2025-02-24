<template lang="html">
  <div class="proficiency-viewer">
    <v-row dense>
      <property-field
        v-if="model.value !== undefined"
        :name="$t('InlineProficiency.jN183F3ufg8Le9jkznJ4p')"
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
      <property-target-tags
        v-if="model.targetByTags"
        :model="model"
      />
      <property-field
        v-else
        :name="$t('CharacterSheetDialog.NnBUF4ZwE2sxY2H9laU5t')"
        :value="model.stats && model.stats.join(', ')"
        mono
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin';
import ProficiencyIcon from '/imports/client/ui/properties/shared/ProficiencyIcon.vue';
import PropertyTargetTags from '/imports/client/ui/properties/viewers/shared/PropertyTargetTags.vue';

export default {
  components: {
    ProficiencyIcon,
    PropertyTargetTags,
  },
  mixins: [propertyViewerMixin],
  computed: {
    proficiencyText(){
      switch (this.model.value){
        case 0.49: return this.$t('SkillProficiency.rdG6DgAZ2pH5uGiEXs9ni');
        case 0.5: return this.$t('ProficiencyViewer.fSzRlRx_9g9BQI5cWRfJ7');
        case 1: return this.$t('SkillProficiency.c7_OrgWVaMZiroKapKs0O');
        case 2: return this.$t('SkillProficiency.Lq-INVfia0gaEurWHuCvq');
        default: return '';
      }
    }
  }
}
</script>
