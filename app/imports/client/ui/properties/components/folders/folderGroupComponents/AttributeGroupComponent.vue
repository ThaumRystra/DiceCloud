<template>
  <div>
    <div
      class="attribute"
      :data-id="dataId"
    >
      <ability-list-tile
        v-if="model.attributeType === 'ability'"
        :model="model"
        @click="$emit('click')"
      />
      <hit-dice-list-tile
        v-else-if="model.attributeType === 'hitDice'"
        :model="model"
        @click="$emit('click')"
        @change="({ type, value }) => damageProperty({type, value: -value})"
      />
      <health-bar
        v-else-if="model.attributeType === 'healthBar'"
        :model="model"
        @change="damageProperty"
        @click="$emit('click')"
      />
      <spell-slot-list-tile
        v-else-if="model.attributeType === 'spellSlot'"
        :model="model"
        @click="$emit('click')"
      />
      <resource-card-content
        v-else-if="model.attributeType === 'resource'"
        :model="model"
        @click="$emit('click')"
        @change="({ type, value, ack }) => damageProperty({type, value: -value, ack})"
        @mouseover="hover = true"
        @mouseleave="hover = false"
      />
      <attribute-card-content
        v-else-if="model.attributeType !== 'utility'"
        class="pointer"
        :model="model"
        @click="$emit('click')"
        @mouseover="hover = true"
        @mouseleave="hover = false"
      />
      <card-highlight :active="hover" />
    </div>
    <folder-group-children
      :model="model"
      @click-property="e => $emit('click-property', e)"
      @sub-click="e => $emit('sub-click', e)"
      @remove="e => $emit('remove', e)"
    />
  </div>
</template>

<script lang="js">
import AbilityListTile from '/imports/client/ui/properties/components/attributes/AbilityListTile.vue';
import HitDiceListTile from '/imports/client/ui/properties/components/attributes/HitDiceListTile.vue';
import HealthBar from '/imports/client/ui/properties/components/attributes/HealthBar.vue';
import SpellSlotListTile from '/imports/client/ui/properties/components/attributes/SpellSlotListTile.vue';
import ResourceCardContent from '/imports/client/ui/properties/components/attributes/ResourceCardContent.vue';
import AttributeCardContent from '/imports/client/ui/properties/components/attributes/AttributeCardContent.vue';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';
import FolderGroupChildren from '/imports/client/ui/properties/components/folders/folderGroupComponents/FolderGroupChildren.vue';

import damageProperty from '/imports/api/creature/creatureProperties/methods/damageProperty.js';

export default {
  components: {
    AbilityListTile,
    HitDiceListTile,
    HealthBar,
    SpellSlotListTile,
    ResourceCardContent,
    AttributeCardContent,
    CardHighlight,
    FolderGroupChildren,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    dataId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
    hover: false,
  }},
  methods: {
    damageProperty(change) {
      damageProperty.call({
        _id: this.model._id,
        operation: change.type,
        value: change.value
      }, e => {
        console.log(change);
        change.ack?.(e);
      });
    },
    log({_id}) {
      console.log(...arguments)
      this.$emit('click-property', { _id });
    }
  }
}
</script>

<style lang="css" scoped>
  .attribute {
    position: relative;
  }
  .pointer {
    cursor: pointer;
  }
</style>