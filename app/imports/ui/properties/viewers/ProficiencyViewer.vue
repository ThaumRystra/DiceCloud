<template lang="html">
  <div class="proficiency-viewer">
    <div class="text-h5 layout">
      {{ model.skill }}
      <proficiency-icon
        :value="model.value"
        class="ml-3 mr-1"
      />
      <div>
        {{ proficiencyText }}
      </div>
    </div>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js';
import ProficiencyIcon from '/imports/ui/properties/shared/ProficiencyIcon.vue';
export default {
	components: {
		ProficiencyIcon,
	},
	mixins: [propertyViewerMixin],
	computed: {
		proficiencyText(){
			switch (this.model.value){
				case 0.5: return 'Half proficiency bonus';
				case 1: return 'Proficient';
				case 2: return 'Double proficiency bonus';
        default: return '';
			}
		}
	}
}
</script>
