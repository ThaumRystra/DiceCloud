<template lang="html">
  <dialog-base>
    <experience-form
      :start-as-milestone="startAsMilestone"
      :model="model"
      :errors="errors"
      @change="change"
      @push="push"
      @pull="pull"
    />
    <div
      slot="actions"
      class="layout row justify-end"
    >
      <v-btn
        flat
        :disabled="!valid"
        @click="insertExperience"
      >
        Insert
      </v-btn>
    </div>
  </dialog-base>
</template>

<script>
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import ExperienceForm from '/imports/ui/creature/experiences/ExperienceForm.vue';
import { ExperienceSchema, insertExperience } from '/imports/api/creature/experience/Experiences.js';
import schemaFormMixin from '/imports/ui/properties/forms/shared/schemaFormMixin.js';

export default {
  components: {
		DialogBase,
    ExperienceForm,
	},
  mixins: [schemaFormMixin],
  provide: {
    context: {
      debounceTime: 0,
    },
  },
  props: {
    creatureIds: {
      type: Array,
      required: true,
    },
    startAsMilestone: {
      type: Boolean,
    },
  },
  data(){
    let schema = ExperienceSchema.omit('creatureId');
    let startingModel = {};
    if (this.startAsMilestone){
      startingModel.levels = 1;
    }
    return {
      model: schema.clean(startingModel),
      schema: schema,
      validationContext: schema.newContext(),
      debounceTime: 0,
    };
  },
  methods:{
    insertExperience(){
      let experience = this.schema.clean(this.model);
      let id = insertExperience.call({
        experience,
        creatureIds: this.creatureIds,
      }, (error) =>  {
        if (error){
          console.error(error);
        }
      });
      this.$store.dispatch('popDialogStack', id);
    }
  }
}
</script>

<style lang="css" scoped>
</style>
