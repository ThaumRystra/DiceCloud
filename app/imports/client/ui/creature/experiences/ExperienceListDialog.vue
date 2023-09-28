<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title>
        Experiences
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        icon
        data-id="experience-add-button"
        @click="addExperience"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn
        icon
        @click="recompute"
      >
        <v-icon>mdi-refresh</v-icon>
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
      <v-icon class="big-icon">
        $vuetify.icons.baby_face
      </v-icon>
      <p class="text-h5">
        No experiences
      </p>
    </div>
    <v-list v-else>
      <v-slide-x-transition
        group
        mode="out"
      >
        <v-list-item
          v-for="experience in experiences"
          :key="experience._id"
          :data-id="experience._id"
        >
          <v-list-item-action class="mr-3">
            <v-list-item-action-text>
              {{ formatDate(experience.date) }}
            </v-list-item-action-text>
          </v-list-item-action>
          <v-list-item-content>
            <template v-if="experience.name">
              <v-list-item-title>
                {{ experience.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ xpText(experience) }}
              </v-list-item-subtitle>
            </template>
            <template v-else>
              <v-list-item-title>
                {{ xpText(experience) }}
              </v-list-item-title>
            </template>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              icon
              :loading="experiencesRemovalLoading.has(experience._id)"
              @click="removeExperience(experience._id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-slide-x-transition>
    </v-list>
  </dialog-base>
</template>

<script lang="js">
import { format } from 'date-fns';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import Experiences, { removeExperience, recomputeExperiences } from '/imports/api/creature/experience/Experiences';

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

<style lang="css">
.big-icon, .big-icon * {
  width: 240px !important;
  height: 240px !important;
}
</style>
