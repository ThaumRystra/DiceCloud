<template>
  <div class="character-sheet-printed fill-height">
    <v-fade-transition mode="out-in">
      <div
        v-if="!$subReady.singleCharacter"
        key="character-loading"
        class="fill-height layout justify-center align-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
      </div>
      <div v-else-if="!creature">
        <v-layout
          column
          align-center
          justify-center
        >
          <h2 style="margin: 48px 28px 16px">
            Character not found
          </h2>
          <h3>
            Either this character does not exist, or you don't have permission
            to view it.
          </h3>
        </v-layout>
      </div>
      <v-theme-provider
        v-else
        light
      >
        <printed-stats :creature-id="creatureId" />
        <printed-features :creature-id="creatureId" />
        <printed-inventory :creature-id="creatureId" />
        <printed-spells
          v-if="!creature.settings.hideSpellsTab"
          :creature-id="creatureId"
        />
        <printed-character :creature-id="creatureId" />
      </v-theme-provider>
    </v-fade-transition>
  </div>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import PrintedStats from '/imports/ui/creature/character/printedCharacterSheet/PrintedStats.vue';
import PrintedFeatures from '/imports/ui/creature/character/printedCharacterSheet/PrintedFeatures.vue';
import PrintedInventory from '/imports/ui/creature/character/printedCharacterSheet/PrintedInventory.vue';
import PrintedSpells from '/imports/ui/creature/character/printedCharacterSheet/PrintedSpells.vue';
import PrintedCharacter from '/imports/ui/creature/character/printedCharacterSheet/PrintedCharacter.vue';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';

export default {
  components: {
    PrintedStats,
    PrintedFeatures,
    PrintedInventory,
    PrintedSpells,
    PrintedCharacter,
  },
  computed: {
    creatureId() {
      return this.$route.params.id
    }
  },
  reactiveProvide: {
    name: 'context',
    include: ['creatureId', 'editPermission'],
  },
  watch: {
    'creature.name'(value) {
      this.$store.commit('setPageTitle', value ? ('Print ' + value) : 'Print Character Sheet');
    },
  },
  mounted() {
    this.$store.commit('setPageTitle',
      (this.creature && this.creature.name) ?
        ('Print ' + this.creature.name) :
        'Print Character Sheet'
    );
    this.nameObserver = Creatures.find({
      creatureId: this.creatureId,
    }, {
      fields: { name: 1 },
    }).observe({
      added: ({ name }) =>
        this.$store.commit('setPageTitle', name ? ('Print ' + name) : 'Print Character Sheet'),
      changed: ({ name }) =>
        this.$store.commit('setPageTitle', name ? ('Print ' + name) : 'Print Character Sheet'),
    });
  },
  beforeDestroy() {
    this.nameObserver.stop();
  },
  meteor: {
    $subscribe: {
      'singleCharacter'() {
        return [this.creatureId];
      },
    },
    creature() {
      return Creatures.findOne(this.creatureId);
    },
    editPermission() {
      try {
        assertEditPermission(this.creature, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
  },
}
</script>

<style>
.character-sheet-printed {
  background: white;
  color: black;
}
</style>
