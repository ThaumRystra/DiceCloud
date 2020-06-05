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
        data-id="experience-add-button"
        @click="addExperience"
      >
        <v-icon>add</v-icon>
      </v-btn>
      <v-btn
        icon
        flat
        @click="recompute"
      >
        <v-icon>refresh</v-icon>
      </v-btn>
    </template>
    <div
      v-if="!$subReady.experiences"
      class="layout column align-center justify-center fill-height"
    >
      <v-progress-circular
        indeterminate
        size="240"
      />
    </div>
    <div
      v-else-if="experiences.length === 0"
      class="layout column align-center justify-center fill-height"
    >
      <v-icon style="font-size: 240px; width: 240px; height: 240px;">
        $vuetify.icons.baby_face
      </v-icon>
      <p class="headline">
        No experiences
      </p>
    </div>
    <v-list v-else>
      <v-slide-x-transition
        group
        mode="out"
      >
        <v-list-tile
          v-for="experience in experiences"
          :key="experience._id"
          :data-id="experience._id"
        >
          <v-list-tile-action class="mr-3">
            <v-list-tile-action-text>
              {{ formatDate(experience.date) }}
            </v-list-tile-action-text>
          </v-list-tile-action>
          <v-list-tile-content>
            <template v-if="experience.name">
              <v-list-tile-title>
                {{ experience.name }}
              </v-list-tile-title>
              <v-list-tile-sub-title>
                {{ xpText(experience) }}
              </v-list-tile-sub-title>
            </template>
            <template v-else>
              <v-list-tile-title>
                {{ xpText(experience) }}
              </v-list-tile-title>
            </template>
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
      </v-slide-x-transition>
    </v-list>
  </dialog-base>
</template>

<script>
import { format } from 'date-fns';
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
    startAsMilestone: {
      type: Boolean,
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
    xpText(experience){
      let xpText = [];
      if (experience.levels === 1){
        xpText.push('1 Milestone level');
      } else if (experience.levels){
        xpText.push(`${experience.levels} Milestone levels`);
      }
      if (experience.xp || !experience.levels){
        xpText.push(`${experience.xp || 0} XP`);
      }
      return xpText.join(', ');
    },
    formatDate(date){
      return format(date, 'YYYY-MM-DD');
    },
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
    addExperience(){
      this.$store.commit('pushDialogStack', {
        component: 'experience-insert-dialog',
        elementId: 'experience-add-button',
        data: {
          creatureIds: [this.creatureId],
          startAsMilestone: this.startAsMilestone,
        },
        callback(id){
          return id;
        }
      });
    },
  },
}
</script>

<style lang="css" scoped>
</style>
