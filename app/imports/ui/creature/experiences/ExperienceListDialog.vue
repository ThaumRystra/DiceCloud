<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        Experiences
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        icon
        flat
        @click="recompute"
      >
        <v-icon>refresh</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-tile
        v-for="experience in experiences"
        :key="experience._id"
      >
        <v-list-tile-content>
          <v-list-tile-title>
            {{ experience.name }}
          </v-list-tile-title>
        </v-list-tile-content>
        <v-list-tile-action>
          <v-btn
            icon
            flat
            :loading="experiencesRemovalLoading.has(experience._id)"
            @click="removeExperience(experience._id)"
          >
            <v-icon>delete</v-icon>
          </v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
  </dialog-base>
</template>

<script>
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import Experiences, { removeExperience, recomputeExperiences } from '/imports/api/creature/experience/Experiences.js';
export default {
  components: {
    DialogBase,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  data(){ return {
    experiencesRemovalLoading: new Set(),
    recomputeLoading: false,
  }},
  meteor: {
    $subscribe: {
      'experiences'(){
        return [this.creatureId];
      },
    },
    experiences(){
      return Experiences.find({
        creatureId: this.creatureId
      }, {
        sort: {date: 1}
      });
    }
  },
  methods: {
    removeExperience(experienceId){
      this.experiencesRemovalLoading.add(experienceId);
      removeExperience.call({experienceId}, (error) => {
        this.experiencesRemovalLoading.delete(experienceId);
        if (error) console.error(error);
      });
    },
    recompute(){
      this.recomputeLoading = true;
      recomputeExperiences.call({creatureId: this.creatureId}, error => {
        this.recomputeLoading = false;
        if (error) console.error(error);
      });
    },
  },
}
</script>

<style lang="css" scoped>
</style>
