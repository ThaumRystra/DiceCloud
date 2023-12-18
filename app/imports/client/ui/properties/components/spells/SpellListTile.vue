<template lang="html">
  <v-list-item
    class="spell"
    v-bind="$attrs"
    :disabled="disabled"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-item-avatar class="spell-avatar">
      <property-icon
        class="mr-2"
        :model="model"
        :color="model.color"
        :disabled="disabled"
      />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{ title }}
      </v-list-item-title>
      <v-list-item-subtitle v-if="spellComponents">
        {{ spellComponents }}
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <smart-checkbox
        v-if="preparingSpells"
        :value="model.prepared || model.alwaysPrepared"
        :disabled="model.alwaysPrepared || context.editPermission === false"
        @click.native.stop="() => {}"
        @change="setPrepared"
      />
      <drag-handle
        v-else-if="!hideHandle"
        :disabled="context.editPermission === false"
        style="height: 100%; width: 40px; cursor: move;"
      />
      <v-btn
        v-else-if="showInfoButton"
        icon
        class="info-icon"
        :disabled="disabled"
        :data-id="`spell-info-btn-${model._id}`"
        @click.stop="$emit('show-info')"
      >
        <v-icon>mdi-information</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="js">
import treeNodeViewMixin from '/imports/client/ui/properties/treeNodeViews/treeNodeViewMixin';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';

export default {
  mixins: [treeNodeViewMixin],
  inject: {
    context: { default: {} }
  },
  props: {
    preparingSpells: Boolean,
    hideHandle: Boolean,
    showInfoButton: Boolean,
    disabled: Boolean,
  },
  computed: {
    hasClickListener() {
      return this.$listeners && !!this.$listeners.click;
    },
    spellComponents() {
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
    click(e) {
      this.$emit('click', e);
    },
    setPrepared(val, ack) {
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

.primary--text .v-icon,
.primary--text .v-list__tile__sub-title {
  color: #b71c1c
}

.theme--light.info-icon {
  color: rgba(0, 0, 0, .54) !important;
}
</style>
