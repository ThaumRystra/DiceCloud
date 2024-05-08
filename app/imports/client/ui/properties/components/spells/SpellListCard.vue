<template lang="html">
  <toolbar-card
    :color="model.color"
    :data-id="model._id"
    @toolbarclick="clickSpellList(model._id)"
  >
    <template slot="toolbar">
      <v-toolbar-title
        v-if="!preparingSpells"
      >
        {{ model.name }}
      </v-toolbar-title>
      <v-spacer v-if="!preparingSpells && preparedError" />
      <v-toolbar-title
        v-if="preparingSpells || preparedError"
        :class="{'error--text' : preparedError}"
      >
        {{ numPrepared }}/{{ model.maxPrepared && model.maxPrepared.value || 0 }} spells prepared
      </v-toolbar-title>
      <v-spacer />
      <v-menu
        v-if="!preparingSpells"
        bottom
        left
        transition="slide-y-transition"
        style="margin-right: -12px;"
      >
        <template #activator="{ on }">
          <v-btn
            icon
            v-on="on"
            @click.stop
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list class="pa-2">
          <v-switch
            v-model="preparingSpells"
            class="ma-2"
            label="Change prepared spells"
            hide-details
          />
        </v-list>
      </v-menu>
      <v-btn
        v-else
        icon
        @click.stop="preparingSpells = false"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </template>
    <!-- Disabled because it changes the height of the card
    <v-card-text
      v-if="preparedError || preparingSpells"
      :class="{'error--text' : preparedError}"
      class="pb-0"
    >
      <div v-if="model.maxPrepared && model.maxPrepared.value">
        {{ numPrepared }}/{{ model.maxPrepared.value }} spells prepared
      </div>
      <v-switch
        v-model="preparingSpells"
        label="Change prepared spells"
      />
    </v-card-text>
    -->
    <spell-list
      :spells="spells"
      :parent-ref="{id: model._id, collection: 'creatureProperties'}"
      :preparing-spells="preparingSpells"
    />
  </toolbar-card>
</template>

<script lang="js">
import ToolbarCard from '/imports/client/ui/components/ToolbarCard.vue';
import SpellList from '/imports/client/ui/properties/components/spells/SpellList.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import { getFilter } from '/imports/api/parenting/parentingFunctions';

export default {
  components: {
    ToolbarCard,
    SpellList,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    organize: Boolean,
  },
  data() {
    return {
      preparingSpells: false,
    }
  },
  meteor: {
    spells() {
      let filter = {
        ...getFilter.descendants(this.model),
        type: 'spell',
        removed: { $ne: true },
      };
      if (this.preparingSpells) {
        filter.deactivatedByAncestor = { $ne: true };
        filter.deactivatedByToggle = { $ne: true };
      } else {
        filter.inactive = { $ne: true };
      }
      return CreatureProperties.find(filter, {
        sort: {
          level: 1,
          order: 1,
        }
      });
    },
    numPrepared() {
      return CreatureProperties.find({
        ...getFilter.descendants(this.model),
        type: 'spell',
        removed: { $ne: true },
        prepared: true,
        alwaysPrepared: { $ne: true },
        deactivatedByAncestor: { $ne: true },
        deactivatedByToggle: { $ne: true },
      }).count();
    },
    preparedError() {
      if (!this.model.maxPrepared) return;
      let numPrepared = this.numPrepared;
      let maxPrepared = this.model.maxPrepared.value || 0;
      return numPrepared !== maxPrepared
    },
  },
  methods: {
    clickSpellList(_id) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `${_id}`,
        data: { _id },
      });
    },
  }
};
</script>

<style lang="css" scoped>

</style>
