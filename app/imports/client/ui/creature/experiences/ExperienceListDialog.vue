<template lang="html">
  <dialog-base>
    <template #toolbar>
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
      v-if="!experiencesSubReady"
      class="d-flex flex-column align-center justify-center fill-height"
    >
      <v-progress-circular
        indeterminate
        size="240"
      />
    </div>
    <div
      v-else-if="experiences.length === 0"
      class="d-flex flex-column align-center justify-center fill-height"
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
          <template #prepend>
            <div class="text-caption">
              {{ formatDate(experience.date) }}
            </div>
          </template>
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
          <template #append>
            <v-btn
              icon
              :loading="experiencesRemovalLoading.has(experience._id)"
              @click="removeExperience(experience._id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-slide-x-transition>
    </v-list>
  </dialog-base>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import { format } from 'date-fns';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import { Meteor } from 'meteor/meteor';
import Experiences, { removeExperience as removeExperienceMethod, recomputeExperiences } from '/imports/api/creature/experience/Experiences';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  creatureId: string;
  startAsMilestone?: boolean;
}>();

const store = useStore(key);
const experiencesRemovalLoading = ref(new Set<string>());
const recomputeLoading = ref(false);

const { result: experiencesSubReady } = autorun(() => {
  const handle = Meteor.subscribe('experiences', props.creatureId);
  return handle.ready();
});

const { result: experiences } = autorun(() =>
  Experiences.find({ creatureId: props.creatureId }, { sort: { date: 1 } }).fetch()
);

function xpText(experience: any) {
  const xpTextParts: string[] = [];
  if (experience.levels === 1) xpTextParts.push('1 Milestone level');
  else if (experience.levels) xpTextParts.push(`${experience.levels} Milestone levels`);
  if (experience.xp || !experience.levels) xpTextParts.push(`${experience.xp || 0} XP`);
  return xpTextParts.join(', ');
}

function formatDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

async function removeExperience(experienceId: string) {
  experiencesRemovalLoading.value.add(experienceId);
  try {
    await removeExperienceMethod.callAsync({ experienceId });
  } catch (error) {
    console.error(error);
  }
  experiencesRemovalLoading.value.delete(experienceId);
}

async function recompute() {
  recomputeLoading.value = true;
  try {
    await recomputeExperiences.callAsync({ creatureId: props.creatureId });
  } catch (error) {
    console.error(error);
  }
  recomputeLoading.value = false;
}

function addExperience() {
  store.commit('pushDialogStack', {
    component: 'experience-insert-dialog',
    elementId: 'experience-add-button',
    data: {
      creatureIds: [props.creatureId],
      startAsMilestone: props.startAsMilestone,
    },
    callback(id: string) { return id; },
  });
}
</script>

<style lang="css">
.big-icon,
.big-icon * {
  width: 240px !important;
  height: 240px !important;
}
</style>
