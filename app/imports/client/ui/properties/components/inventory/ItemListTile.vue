<script setup lang="ts">
import { ref, computed, useAttrs, inject } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import PROPERTIES from '/imports/constants/PROPERTIES';
import adjustQuantity from '/imports/api/creature/creatureProperties/methods/adjustQuantity';
import IncrementButton from '/imports/client/ui/components/IncrementButton.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';

const props = withDefaults(defineProps<{
  itemId: string;
  selected?: boolean;
  hideIcon?: boolean;
  preparingSpells?: boolean;
}>(), {
  selected: false,
  hideIcon: false,
  preparingSpells: false,
});

const emit = defineEmits(['click']);
const context = inject('context', {} as any);
const attrs = useAttrs();
const incrementLoading = ref(false);

const { result: model } = autorun(() =>
  CreatureProperties.findOne(props.itemId)
);

const hasClickListener = computed(() => !!attrs.onClick);

const title = computed(() => {
  const m = model.value;
  if (!m) return undefined;
  if (m.quantity !== 1) {
    if (m.plural) {
      return `${m.quantity} ${m.plural}`;
    } else if (m.name) {
      return `${m.quantity} ${m.name}`;
    }
  } else if (m.name) {
    return m.name;
  }
  const prop = (PROPERTIES as any)[m.type];
  return prop && prop.name;
});

function click(e: Event) {
  emit('click', e);
}

async function changeQuantity({ type, value }: { type: string; value: any }) {
  incrementLoading.value = true;
  try {
    await adjustQuantity.callAsync({
      _id: model.value._id,
      operation: type,
      value,
    });
  } catch (error: any) {
    snackbar({ text: error.reason });
    console.error(error);
  }
  incrementLoading.value = false;
}
</script>

<template lang="html">
  <v-list-item
    class="item"
    v-on="hasClickListener ? {click} : {}"
  >
    <template #prepend>
      <property-icon
        class="mr-2"
        :model="model"
        :color="model.color"
      />
    </template>
    <v-list-item-title>
      {{ title }}
    </v-list-item-title>
    <template #append>
      <v-icon
        v-if="model.attuned"
        style="min-width: 40px;"
      >
        $vuetify.icons.spell
      </v-icon>
      <increment-button
        v-if="context.creatureId && model.showIncrement"
        icon
        color="primary"
        :disabled="context.editPermission === false"
        :value="model.quantity"
        :loading="incrementLoading"
        style="min-width: 40px;"
        @change="changeQuantity"
      />
      <drag-handle 
        :disabled="context.editPermission === false"
        class="drag-handle"
        style="height: 100%; width: 40px; cursor: move;"
      />
    </template>
  </v-list-item>
</template>

<style lang="css" scoped>
.item-avatar {
  min-width: 32px;
}

.item {
  background-color: inherit;
}
</style>
