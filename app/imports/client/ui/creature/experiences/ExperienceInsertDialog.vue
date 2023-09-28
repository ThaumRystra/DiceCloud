<template lang="html">
  <dialog-base>
    <v-toolbar-title slot="toolbar">
      Add Experience
    </v-toolbar-title>
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
      class="layout justify-end"
    >
      <v-btn
        text
        :disabled="!valid"
        @click="insertExperience"
      >
        Insert
      </v-btn>
    </div>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import ExperienceForm from '/imports/client/ui/creature/experiences/ExperienceForm.vue';
import { ExperienceSchema, insertExperience } from '/imports/api/creature/experience/Experiences';
import schemaFormMixin from '/imports/client/ui/properties/forms/shared/schemaFormMixin';

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
  data() {
    let schema = ExperienceSchema.omit('creatureId');
    let startingModel = {};
    if (this.startAsMilestone) {
      startingModel.levels = 1;
    }
    return {
      model: schema.clean(startingModel),
      schema: schema,
      validationContext: schema.newContext(),
      debounceTime: 0,
    };
  },
  methods: {
    insertExperience() {
      let experience = this.schema.clean(this.model);
      let id = insertExperience.call({
        experience,
        creatureIds: this.creatureIds,
      }, (error) => {
        if (error) {
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
