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
        <div class="page pa-3">
          <div class="px-3 d-flex align-center">
            <div class="logo-background" />
            <div class="creature-name mr-3">
              {{ creature.name }}
            </div>
            <div class="text-right flex mr-4">
              <div v-if="creature.alignment || background">
                {{ creature.alignment }} {{ background }}
              </div>
              <dir v-if="race || creature.gender">
                {{ race }} {{ creature.gender }}
              </dir>
              <div v-if="level && classes && classes.length === 1">
                Level {{ level }} {{ classes[0].name }}
              </div>
              <div v-else-if="level">
                Level {{ level }} ({{ classes.map(c => `${c.name} ${c.level}`).join(', ') }})
              </div>
            </div>
            <qrcode-vue
              style="height: 100px"
              render-as="svg"
              :value="creatureUrl"
            />
          </div>
          <div
            class="text-right mt-3 mr-4"
            style="font-size: 8pt; margin-bottom: -4px;"
          >
            {{ creatureUrl }}
          </div>
          <printed-stats :creature-id="creatureId" />
          <printed-inventory :creature-id="creatureId" />
          <printed-spells
            v-if="!creature.settings.hideSpellsTab"
            :creature-id="creatureId"
          />
        </div>
      </v-theme-provider>
    </v-fade-transition>
  </div>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import PrintedStats from '/imports/ui/creature/character/printedCharacterSheet/PrintedStats.vue';
import PrintedInventory from '/imports/ui/creature/character/printedCharacterSheet/PrintedInventory.vue';
import PrintedSpells from '/imports/ui/creature/character/printedCharacterSheet/PrintedSpells.vue';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import CreatureVariables from '/imports/api/creature/creatures/CreatureVariables.js';
import QrcodeVue from 'qrcode.vue'

export default {
  components: {
    PrintedStats,
    PrintedInventory,
    PrintedSpells,
    QrcodeVue,
  },
  computed: {
    creatureId() {
      return this.$route.params.id
    },
    creatureUrl() {
      let props = this.$router.resolve({ 
        name: 'characterSheet',
        params: { id: this.creatureId},
      });
      return new URL(props?.href, document.baseURI).href
    },
    level() {
      return this.variables?.level?.value;
    },
    highestLevels(){
      let highestLevels = {};
      let highestLevelsList = [];
      this.classLevels.forEach(classLevel => {
        let name = classLevel.variableName;
        if (
          !highestLevels[name] ||
          highestLevels[name].level < classLevel.level
        ){
          highestLevels[name] = classLevel;
        }
      });
      for (let name in highestLevels){
        highestLevelsList.push(highestLevels[name]);
      }
      highestLevelsList.sort((a, b) => a.level - b.level);
      return highestLevelsList;
    },
    classes() {
      return [
        ...this.highestLevels,
        ...this.classProperties
      ].sort((a, b) => a.order - b.order);
    },
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
    variables() {
      return CreatureVariables.findOne({ _creatureId: this.creatureId }) || {};
    },
    race() {
      if (this.variables?.race?.value?.valueType === 'string') return this.variables.race.value.value;
      const prop = CreatureProperties.findOne({
        'ancestors.id': this.creatureId,
        tags: 'race',
        removed: { $ne: true },
        inactive: { $ne: true },
        overridden: { $ne: true },
      });
      if (prop?.name) return prop.name;
      return '';
    },
    background() {
      if (this.variables?.background?.value?.valueType === 'string') return this.variables.background.value.value;
      const prop = CreatureProperties.findOne({
        'ancestors.id': this.creatureId,
        tags: 'background',
        removed: { $ne: true },
        inactive: { $ne: true },
        overridden: { $ne: true },
      });
      if (prop?.name) return prop.name;
      return '';
    },
    classProperties(){
      return CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'class',
        removed: {$ne: true},
        inactive: {$ne: true},
      }, {
        sort: {order: 1}
      }).fetch();
    },
    classLevels() {
      const classVariableNames = this.classProperties.map(c => c.variableName)
      return CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'classLevel',
        variableName: {$nin: classVariableNames},
        removed: {$ne: true},
        inactive: {$ne: true},
      }, {
        sort: {order: 1}
      });
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
  font-size: 11pt;
}
.page {
  padding: 4px;
}
.character-sheet-printed .inactive {
  opacity: 1 !important;
}
.character-sheet-printed .creature-name {
  font-size: 24pt;
  background-color: white;
}
.character-sheet-printed .logo-background {
  width: 60px;
  height: 60px;
  margin-right: 8px;
  background-image: url(/crown-dice-logo-cropped-transparent.png);
  background-size: contain;
  background-position: 0 center;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.character-sheet-printed .v-divider {
  border-color: rgba(0,0,0,0.3);
  max-width: unset;
}

.character-sheet-printed .double-border {
  position: relative;
  padding: 11px 10px;
  page-break-inside: avoid;
}

.character-sheet-printed .double-border::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border-image-source: url(/images/print/doubleLineImageBorder.png);
  border-image-slice: 110 126 fill;
  border-image-width: 16px;
  border-image-repeat: stretch;
  box-sizing: content-box;
  z-index: -1;
}

.character-sheet-printed .octagon-border {
  position: relative;
  padding: 4px 20px;
  page-break-inside: avoid;
}
.character-sheet-printed .octagon-border::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border-image: url(/images/print/octagonBorder.png) 124 118 fill;
  border-image-width: 22px;
  z-index: -1;
}

.character-sheet-printed .stats .label {
  font-size: 10pt;
  font-variant: small-caps;
}

.character-sheet-printed .label {
  font-size: 14pt;
  font-variant: all-small-caps;
  font-weight: 600;
}

.character-sheet-printed .span-all {
  column-span: all;
}

@media screen {
  .character-sheet-printed {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .character-sheet-printed .page {
    width: 210mm;
  }
}
@media print {
  header {
    display: none !important;
  }
  nav {
    display: none !important;
  }
  .v-main {
    padding: 0 !important;
  }
}
</style>
