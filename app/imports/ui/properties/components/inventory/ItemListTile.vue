<template lang="html">
  <v-list-tile
    class="item"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-tile-avatar class="item-avatar">
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
    </v-list-tile-content>
    <v-list-tile-action>
      <increment-button
        v-if="context.creatureId && model.showIncrement"
        icon
        flat
        color="primary"
        :disabled="context.editPermission === false"
        :value="model.quantity"
        @change="changeQuantity"
      >
        <v-icon>
          $vuetify.icons.abacus
        </v-icon>
      </increment-button>
    </v-list-tile-action>
    <v-list-tile-action>
      <v-icon
        :disabled="context.editPermission === false"
        style="height: 100%; width: 40px; cursor: move;"
        class="handle"
      >
        drag_indicator
      </v-icon>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
import treeNodeViewMixin from '/imports/ui/properties/treeNodeViews/treeNodeViewMixin.js';
import PROPERTIES from '/imports/constants/PROPERTIES.js';
import adjustQuantity from '/imports/api/creature/creatureProperties/methods/adjustQuantity.js';
import IncrementButton from '/imports/ui/components/IncrementButton.vue';

export default {
  components:{
    IncrementButton,
  },
  mixins: [treeNodeViewMixin],
  inject: {
    context: { default: {} }
  },
  props: {
    preparingSpells: Boolean,
  },
  computed: {
    hasClickListener(){
      return this.$listeners && !!this.$listeners.click;
    },
    title(){
      let model = this.model;
      if (!model) return;
      if (model.quantity !== 1){
        if (model.plural){
          return `${model.quantity} ${model.plural}`;
        } else if (model.name){
          return `${model.quantity} ${model.name}`;
        }
      } else if (model.name) {
        return model.name;
      }
      let prop = PROPERTIES[model.type]
      return prop && prop.name;
    }
  },
  methods: {
    click(e){
			this.$emit('click', e);
		},
    changeQuantity({type, value}) {
      adjustQuantity.call({
        _id: this.model._id,
        operation: type,
        value: value
      });
    }
  },
}
</script>

<style lang="css" scoped>
.item-avatar {
  min-width: 32px;
}
.item {
  background-color: inherit;
}
</style>
