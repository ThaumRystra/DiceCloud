<template lang="html">
  <v-list-tile
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
  </v-list-tile>
</template>

<script>
import treeNodeViewMixin from '/imports/ui/properties/treeNodeViews/treeNodeViewMixin.js';
export default {
  mixins: [treeNodeViewMixin],
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
  },
}
</script>

<style lang="css" scoped>
.spell-avatar {
  min-width: 32px;
}
</style>
