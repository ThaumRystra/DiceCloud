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
        @change="damageProperty"
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
        @change="damageProperty"
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
import doAction from '/imports/client/ui/creature/actions/doAction';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import getPropertyTitle from '/imports/client/ui/properties/shared/getPropertyTitle';

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
    damageProperty({value, type, ack}) {
      const model = this.model;
      if (type === 'increment') value = -value;
      doAction(model, this.$store, model._id, {
        subtaskFn: 'damageProp',
        prop: model,
        targetIds: [model.root.id],
        params: {
          title: getPropertyTitle(model),
          operation: type,
          value,
          targetProp: model,
        }
      }).then(() =>{
        ack?.();
      }).catch((error) => {
        if (ack) {
          ack(error);
        } else  {
          snackbar({ text: error.reason || error.message || error.toString() });
          console.error(error);
        }
      });
    },
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