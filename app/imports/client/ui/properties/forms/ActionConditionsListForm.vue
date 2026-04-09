<template lang="html">
  <div class="mt-4">
    <v-slide-x-transition group>
      <div
        v-for="(condition, i) in model"
        :key="condition._id || i"
      >
        <div class="d-flex align-center">
          <div style="flex-grow: 1;">
            <action-condition-form
              :model="condition"
              @change="({path, value, ack}) => change([i, ...path], value, ack)"
            />
          </div>
          <v-btn
            variant="outlined"
            icon
            size="large"
            class="ma-3"
            style="margin-bottom: 30px !important;"
            @click="$emit('pull', {path: [i]})"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </div>
    </v-slide-x-transition>
  </div>
</template>

<script setup lang="ts">
import ActionConditionForm from '/imports/client/ui/properties/forms/ActionConditionForm.vue';

withDefaults(defineProps<{
  model: Record<string, any>;
  errors?: Record<string, string>;
}>(), { errors: () => ({}) });

const emit = defineEmits(['change', 'pull']);

function change(path: string | string[], value: any, ack?: Function) {
  const pathArray = Array.isArray(path) ? path : [path];
  emit('change', { path: pathArray, value, ack });
}
</script>
