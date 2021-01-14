<template lang="html">
  <div class="inventory">
    <column-layout wide-columns>
      <div>
        <v-card
          hover
          data-id="creature-summary"
          @click="showCharacterForm"
        >
          <v-img
            v-if="creature.picture"
            :src="creature.picture"
          />
          <v-card-title class="title">
            {{ creature.name }}
          </v-card-title>
          <v-card-text>
            {{ creature.alignment }}<br>
            {{ creature.gender }}
          </v-card-text>
        </v-card>
      </div>
      <div>
        <toolbar-card
          data-id="slot-card"
          @toolbarclick="showSlotDialog"
        >
          <v-toolbar-title slot="toolbar">
            Build
          </v-toolbar-title>
          <v-card-text style="background-color: inherit;">
            <slots :creature-id="creatureId" />
          </v-card-text>
        </toolbar-card>
      </div>
      <div>
        <v-card class="class-details">
          <v-card-title
            v-if="creature.variables.level"
            class="title"
          >
            Level {{ creature.variables.level.value }}
          </v-card-title>
          <v-list>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title
                  v-if="
                    creature.variables.milestoneLevels &&
                      creature.variables.milestoneLevels.value
                  "
                >
                  {{ creature.variables.milestoneLevels.value }} Milestone levels
                </v-list-tile-title>
                <v-list-tile-title v-else>
                  {{
                    creature.variables.xp &&
                      creature.variables.xp.value ||
                      0
                  }} XP
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn
                  flat
                  icon
                  data-id="experience-info-button"
                  @click="showExperienceList"
                >
                  <v-icon>info</v-icon>
                </v-btn>
              </v-list-tile-action>
              <v-list-tile-action>
                <v-btn
                  flat
                  icon
                  data-id="experience-add-button"
                  @click="addExperience"
                >
                  <v-icon>add</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
            <v-list-tile
              v-for="classLevel in highestClassLevels"
              :key="classLevel._id"
            >
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ classLevel.name }}
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-avatar>
                {{ classLevel.level }}
              </v-list-tile-avatar>
            </v-list-tile>
          </v-list>
        </v-card>
      </div>
      <div
        v-for="note in notes"
        :key="note._id"
      >
        <note-card
          :model="note"
        />
      </div>
    </column-layout>
  </div>
</template>

<script>
import Creatures from '/imports/api/creature/Creatures.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import ColumnLayout from '/imports/ui/components/ColumnLayout.vue';
import NoteCard from '/imports/ui/properties/components/persona/NoteCard.vue';
import getActiveProperties from '/imports/api/creature/getActiveProperties.js';
import Slots from '/imports/ui/creature/slots/Slots.vue';
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';

export default {
  components: {
    ColumnLayout,
    NoteCard,
    Slots,
    ToolbarCard,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    },
  },
  computed: {
    highestClassLevels(){
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
  },
  mounted(){
    if (this.$store.state.showBuildDialog){
      this.$store.commit('setShowBuildDialog', false);
      this.showSlotDialog();
    }
  },
  meteor: {
    notes(){
      return CreatureProperties.find({
        'ancestors.id': this.creatureId,
        type: 'note',
        removed: {$ne: true},
      }, {
        sort: {order: 1},
      });
    },
    creature(){
      return Creatures.findOne(this.creatureId);
    },
    classLevels(){
      return getActiveProperties({
        ancestorId: this.creatureId,
        filter: {type: 'classLevel'},
      });
    },
  },
  methods: {
    showCharacterForm(){
      this.$store.commit('pushDialogStack', {
        component: 'creature-form-dialog',
        elementId: 'creature-summary',
        data: {
          _id: this.creatureId,
        },
      });
    },
    addExperience(){
      this.$store.commit('pushDialogStack', {
        component: 'experience-insert-dialog',
        elementId: 'experience-add-button',
        data: {
          creatureIds: [this.creatureId],
          startAsMilestone: this.creature.variables.milestoneLevels &&
            !!this.creature.variables.milestoneLevels.value,
        },
      });
    },
    showExperienceList(){
      this.$store.commit('pushDialogStack', {
        component: 'experience-list-dialog',
        elementId: 'experience-info-button',
        data: {
          creatureId: this.creatureId,
          startAsMilestone: this.creature.variables.milestoneLevels &&
            !!this.creature.variables.milestoneLevels.value,
        },
      });
    },
    showSlotDialog(){
      this.$store.commit('pushDialogStack', {
        component: 'slot-details-dialog',
        elementId: 'slot-card',
        data: {
          creatureId: this.creatureId,
        },
      });
    },
  },
};
</script>

<style lang="css" scoped>
</style>
