<template>
  <v-app-bar
    app
    class="character-sheet-printed-toolbar"
    :color="toolbarColor"
    :dark="isDark"
    :light="!isDark"
    clipped-right
    :extended="$vuetify.breakpoint.smAndUp"
    :tabs="$vuetify.breakpoint.smAndUp"
    dense
  >
    <v-app-bar-nav-icon @click="toggleDrawer" />
    <v-btn
      icon
      :to="characterUrl"
    >
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
    <v-toolbar-title>
      <v-fade-transition mode="out-in">
        <div :key="$store.state.pageTitle">
          {{ $store.state.pageTitle }}
        </div>
      </v-fade-transition>
    </v-toolbar-title>
    <v-spacer />
    <div
      slot="extension"
      style="width: 100%"
    >
      <v-btn
        class="print-fab"
        color="accent"
        elevation="4"
        fab
        @click="print"
      >
        <v-icon>mdi-printer</v-icon>
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures';
import { mapMutations } from 'vuex';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import getThemeColor from '/imports/client/ui/utility/getThemeColor';
import getCreatureUrlName from '/imports/api/creature/creatures/getCreatureUrlName';

export default {
  inject: {
    context: { default: {} }
  },
  computed: {
    creatureId() {
      return this.$route.params.id;
    },
    toolbarColor() {
      if (this.creature && this.creature.color) {
        return this.creature.color;
      } else {
        return getThemeColor('secondary');
      }
    },
    isDark() {
      return isDarkColor(this.toolbarColor);
    },
    characterUrl() {
      if (!this.creature) return;
      return `/character/${this.creature._id}/${getCreatureUrlName(this.creature)}`;
    },
  },
  methods: {
    ...mapMutations([
      'toggleDrawer',
    ]),
    print() {
      print();
    },
  },
  meteor: {
    creature() {
      return Creatures.findOne(this.creatureId);
    },
  },
}
</script>

<style scoped>
  .print-fab {
    position: absolute;
    bottom: -24px;
    right: 24px;
  }
</style>