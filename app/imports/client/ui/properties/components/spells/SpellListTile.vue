<script setup lang="ts">
import { computed, useAttrs, inject } from 'vue';
import { useStore } from 'vuex';
import PROPERTIES from '/imports/constants/PROPERTIES';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';

const props = withDefaults(defineProps<{
  model?: Record<string, any>;
  selected?: boolean;
  hideIcon?: boolean;
  preparingSpells?: boolean;
  showInfoButton?: boolean;
  disabled?: boolean;
}>(), {
  model: () => ({}),
  selected: false,
  hideIcon: false,
  preparingSpells: false,
  showInfoButton: false,
  disabled: false,
});

const emit = defineEmits(['click']);
const context = inject('context', {} as any);
const attrs = useAttrs();

const hasClickListener = computed(() => !!attrs.onClick);

const title = computed(() => {
  const model = props.model;
  if (!model) return undefined;
  if (model.name) return model.name;
  const prop = (PROPERTIES as any)[model.type];
  return prop && prop.name;
});

const spellComponents = computed(() => {
  const components: string[] = [];
  if (props.model.ritual) components.push('R');
  if (props.model.concentration) components.push('C');
  if (props.model.verbal) components.push('V');
  if (props.model.somatic) components.push('S');
  if (props.model.material) components.push(`M (${props.model.material})`);
  return components.join(', ');
});

function click(e: Event) {
  emit('click', e);
}

async function setPrepared(val: boolean, ack?: Function) {
  try {
    await updateCreatureProperty.callAsync({
      _id: props.model._id,
      path: ['prepared'],
      value: val,
    });
    if (ack) ack();
  } catch (error: any) {
    if (ack) ack(error.reason || error.message || error);
    else console.error(error);
  }
}
</script>

<template lang="html">
  <v-list-item
    class="spell"
    v-bind="$attrs"
    :disabled="disabled"
    v-on="hasClickListener ? {click} : {}"
  >
    <template #prepend>
      <property-icon
        class="mr-2"
        :model="model"
        :color="model.color"
        :disabled="disabled"
      />
    </template>
    <v-list-item-title>
      {{ title }}
    </v-list-item-title>
    <v-list-item-subtitle v-if="spellComponents">
      {{ spellComponents }}
    </v-list-item-subtitle>
    <template
      v-if="preparingSpells || showInfoButton"
      #append
    >
      <smart-checkbox
        v-if="preparingSpells"
        :value="model.prepared || model.alwaysPrepared"
        :disabled="model.alwaysPrepared || context.editPermission === false"
        @click.stop="() => {}"
        @change="setPrepared"
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
    </template>
  </v-list-item>
</template>

<style lang="css" scoped>
.spell-avatar {
  min-width: 32px;
}

.spell {
  background-color: inherit;
}

.text-primary .v-icon,
.text-primary .v-list__tile__sub-title {
  color: #b71c1c
}

.v-theme--light.info-icon {
  color: rgba(0, 0, 0, .54) !important;
}
</style>
