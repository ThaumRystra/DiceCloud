<script setup lang="ts">
import { ref, inject } from 'vue';
import AttributesConsumedListForm from '/imports/client/ui/properties/forms/AttributesConsumedListForm.vue';
import ActionConditionsListForm from '/imports/client/ui/properties/forms/ActionConditionsListForm.vue';
import ItemsConsumedListForm from '/imports/client/ui/properties/forms/ItemsConsumedListForm.vue';

withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
  parentTarget?: string;
  buffsStored?: boolean;
}>(), {
  errors: () => ({}),
  parentTarget: undefined,
  buffsStored: undefined,
});

const emit = defineEmits(['change', 'push']);

const context = inject<any>('context', {});

function change(path: string | string[], value: any, ack?: Function) {
  const pathArray = Array.isArray(path) ? path : [path];
  emit('change', { path: pathArray, value, ack });
}

const addResourceLoading = ref(false);

function addAttributesConsumed() {
  addResourceLoading.value = true;
  emit('push', {
    path: ['attributesConsumed'],
    value: { _id: Random.id() },
    ack() {
      addResourceLoading.value = false;
    },
  });
}

function addItemsConsumed() {
  addResourceLoading.value = true;
  emit('push', {
    path: ['itemsConsumed'],
    value: { _id: Random.id() },
    ack() {
      addResourceLoading.value = false;
    },
  });
}

function addCondition() {
  addResourceLoading.value = true;
  emit('push', {
    path: ['conditions'],
    value: { _id: Random.id() },
    ack() {
      addResourceLoading.value = false;
    },
  });
}
</script>

<template lang="html">
  <div class="resources-form">
    <div
      v-if="model.conditions && model.conditions.length"
      class="text-subtitle-1"
    >
      Conditions
    </div>
    <action-conditions-list-form
      :model="model.conditions"
      @change="({path, value, ack}) => $emit('change', {path: ['conditions', ...path], value, ack})"
      @push="({path, value, ack}) => $emit('push', {path: ['conditions', ...path], value, ack})"
      @pull="({path, ack}) => $emit('pull', {path: ['conditions', ...path], ack})"
    />
    <div
      v-if="model.attributesConsumed && model.attributesConsumed.length"
      class="text-subtitle-1"
    >
      Attributes
    </div>
    <attributes-consumed-list-form
      :model="model.attributesConsumed"
      @change="({path, value, ack}) => $emit('change', {path: ['attributesConsumed', ...path], value, ack})"
      @push="({path, value, ack}) => $emit('push', {path: ['attributesConsumed', ...path], value, ack})"
      @pull="({path, ack}) => $emit('pull', {path: ['attributesConsumed', ...path], ack})"
    />
    <div
      v-if="model.itemsConsumed && model.itemsConsumed.length"
      class="text-subtitle-1"
    >
      Ammo
    </div>
    <items-consumed-list-form
      :model="model.itemsConsumed"
      @change="({path, value, ack}) => $emit('change', {path: ['itemsConsumed', ...path], value, ack})"
      @push="({path, value, ack}) => $emit('push', {path: ['itemsConsumed', ...path], value, ack})"
      @pull="({path, ack}) => $emit('pull', {path: ['itemsConsumed', ...path], ack})"
    />
    <v-menu
      origin="center center"
      transition="scale-transition"
    >
      <template #activator="{ props }">
        <v-btn
          :loading="addResourceLoading"
          :disabled="addResourceLoading || context.editPermission === false"
          icon
          variant="outlined"
          color="accent"
          v-bind="props"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="addCondition">
          <v-list-item-title>Add Condition</v-list-item-title>
        </v-list-item>
        <v-list-item @click="addAttributesConsumed">
          <v-list-item-title>Add Resource</v-list-item-title>
        </v-list-item>
        <v-list-item @click="addItemsConsumed">
          <v-list-item-title>Add Ammo</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<style lang="css" scoped>

</style>
