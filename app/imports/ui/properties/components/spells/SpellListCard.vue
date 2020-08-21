<template lang="html">
  <toolbar-card
    :color="model.color"
    :data-id="model._id"
    @toolbarclick="clickSpellList(model._id)"
  >
    <template slot="toolbar">
      <v-toolbar-title>
        {{ model.name }}
      </v-toolbar-title>
      <v-spacer />
      <v-menu
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
            <v-icon>more_vert</v-icon>
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
    </template>
    <v-expand-transition>
      <v-card-text
        v-if="preparedError || preparingSpells"
        :class="{'error--text' : preparedError}"
        class="pb-0"
      >
        {{ numPrepared }}/{{ model.maxPreparedResult }} spells prepared
        <v-switch
          v-model="preparingSpells"
          label="Change prepared spells"
        />
      </v-card-text>
    </v-expand-transition>
    <spell-list
      :spells="spells"
      :parent-ref="{id: model._id, collection: 'creatureProperties'}"
      :preparing-spells="preparingSpells"
    />
  </toolbar-card>
</template>

<script>
import ToolbarCard from '/imports/ui/components/ToolbarCard.vue';
import SpellList from '/imports/ui/properties/components/spells/SpellList.vue';
import getActiveProperties from '/imports/api/creature/getActiveProperties.js';

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
  data(){ return {
    preparingSpells: false,
  }},
  meteor: {
    spells(){
      return getActiveProperties({
        ancestorId: this.model._id,
        filter: {
          type: 'spell',
        },
        options: {
          sort: {
            level: 1,
            order: 1,
          },
        },
      });
    },
    numPrepared(){
      return getActiveProperties({
        ancestorId: this.model._id,
        filter: {
          type: 'spell',
          prepared: true,
          alwaysPrepared: {$ne: true},
        },
      }).length;
    },
    preparedError(){
      let numPrepared = this.numPrepared;
      let maxPrepared = this.model.maxPreparedResult;
      return numPrepared !== maxPrepared
    },
  },
	methods: {
		clickSpellList(_id){
			this.$store.commit('pushDialogStack', {
				component: 'creature-property-dialog',
				elementId: `${_id}`,
				data: {_id},
			});
		},
	}
};
</script>

<style lang="css" scoped>
</style>
