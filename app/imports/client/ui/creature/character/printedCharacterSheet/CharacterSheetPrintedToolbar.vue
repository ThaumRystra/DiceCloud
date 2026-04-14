<script setup lang="ts">
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { autorun } from 'vue-meteor-tracker';
import Creatures from '/imports/api/creature/creatures/Creatures';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import getThemeColor from '/imports/client/ui/utility/getThemeColor';
import getCreatureUrlName from '/imports/api/creature/creatures/getCreatureUrlName';
import { key } from '/imports/client/ui/vuexStore';

const context = inject('context', {} as any);
const route = useRoute();
const store = useStore(key);

const creatureId = computed(() => route.params.id as string);

const { result: creature } = autorun(() => Creatures.findOne(creatureId.value));

const toolbarColor = computed(() => {
  if (creature.value && creature.value.color) {
    return creature.value.color;
  }
  return getThemeColor('secondary');
});

const isDark = computed(() => isDarkColor(toolbarColor.value));

const characterUrl = computed(() => {
  if (!creature.value) return undefined;
  return `/character/${creature.value._id}/${getCreatureUrlName(creature.value)}`;
});

function toggleDrawer() {
  store.commit('toggleDrawer');
}

function printPage() {
  print();
}
</script>

<template>
  <v-app-bar
    class="character-sheet-printed-toolbar"
    :color="toolbarColor"
    :theme="isDark ? 'dark' : 'light'"
    density="compact"
  >
    <v-app-bar-nav-icon @click="toggleDrawer" />
    <v-btn
      icon="mdi-arrow-left"
      :to="characterUrl"
    />
    <v-toolbar-title>
      <v-fade-transition mode="out-in">
        <div :key="$store.state.pageTitle">
          {{ $store.state.pageTitle }}
        </div>
      </v-fade-transition>
    </v-toolbar-title>
    <v-spacer />
    <template #extension>
      <div style="width: 100%">
        <v-btn
          class="print-fab"
          color="accent"
          elevation="4"
          icon="mdi-printer"
          @click="print"
        />
      </div>
    </template>
  </v-app-bar>
</template>

<style scoped>
.print-fab {
  position: absolute;
  bottom: -24px;
  right: 24px;
}
</style>
