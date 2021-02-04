<template lang="html">
  <v-list-tile
    class="spell"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-tile-avatar class="spell-avatar">
      <property-icon
        class="mr-2"
        :model="model"
        :color="model.color"
      />
    </v-list-tile-avatar>
    <v-list-tile-content>
      <v-list-tile-title>
        {{ title }}
      </v-list-tile-title>
      <v-list-tile-sub-title v-if="components">
        {{ components }}
      </v-list-tile-sub-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <smart-checkbox
        v-if="preparingSpells"
        :value="model.prepared || model.alwaysPrepared"
        :disabled="model.alwaysPrepared"
        @click.native.stop="() => {}"
        @change="setPrepared"
      />
      <v-icon
        v-else-if="!hideHandle"
        style="height: 100%; width: 40px; cursor: move;"
        class="handle"
      >
        drag_indicator
      </v-icon>
      <v-btn
        v-else-if="showInfoButton"
        icon
        flat
        class="info-icon"
        :data-id="`spell-info-btn-${model._id}`"
        @click.stop="$emit('show-info')"
      >
        <v-icon>info</v-icon>
      </v-btn>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
import treeNodeViewMixin from '/imports/ui/properties/treeNodeViews/treeNodeViewMixin.js';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty.js';

export default {
  mixins: [treeNodeViewMixin],
  props: {
    preparingSpells: Boolean,
    hideHandle: Boolean,
    showInfoButton: Boolean,
  },
  computed: {
    hasClickListener(){
      return this.$listeners && !!this.$listeners.click;
    },
    components(){
      let components = [];
      if (this.model.ritual) components.push('R');
      if (this.model.concentration) components.push('C');
      if (this.model.verbal) components.push('V');
      if (this.model.somatic) components.push('S');
      if (this.model.material) components.push(`M (${this.model.material})`);
      return components.join(', ');
    },
  },
  methods: {
    click(e){
			this.$emit('click', e);
		},
    setPrepared(val, ack){
      updateCreatureProperty.call({
        _id: this.model._id,
        path: ['prepared'],
        value: val
      }, ack);
    }
  },
}
</script>

<style lang="css" scoped>
.spell-avatar {
  min-width: 32px;
}
.spell {
  background-color: inherit;
}
.primary--text .v-icon, .primary--text .v-list__tile__sub-title {
  color: #b71c1c
}
.theme--light.info-icon{
  color: rgba(0,0,0,.54) !important;
}
</style>
