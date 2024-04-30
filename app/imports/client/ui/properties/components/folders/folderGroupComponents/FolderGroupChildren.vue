<template>
  <div
    v-if="properties && properties.length"
  >
    <component
      :is="prop.type"
      v-for="prop in properties"
      :key="prop._id"
      :model="prop"
      :data-id="prop._id"
      @click="$emit('click-property', {_id: prop._id})"
      @click-property="(e) => $emit('click-property', e)"
      @sub-click="(e) => $emit('sub-click', e)"
      @remove="$emit('remove', prop._id)"
    />
  </div>
</template>

<script lang="js">
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import propComponents from '/imports/client/ui/properties/components/folders/propertyComponentIndex';

export default {
  props: {
    model: {
      type: Object,
      required: true,
    }
  },
  beforeCreate() {
    Object.assign(this.$options.components, propComponents);
  },
  meteor: {
    properties() {
      const props = [];
      CreatureProperties.find({
        'parentId': this.model._id,
        removed: { $ne: true },
        overridden: { $ne: true },
        $or: [
          {
            type: 'toggle',
            showUI: true,
            deactivatedByAncestor: { $ne: true },
            deactivatedByToggle: { $ne: true },
          },
          {
            type: { $ne: 'toggle' },
            inactive: { $ne: true },
          },
        ],
        $nor: [
          { hideWhenTotalZero: true, total: 0 },
          { hideWhenValueZero: true, value: 0 },
        ],
      }, {
        sort: { left: 1 },
      }).forEach(prop => {
        if (propComponents[prop.type]) {
          props.push(prop);
        }
      });
      return props;
    },
  },
}
</script>
