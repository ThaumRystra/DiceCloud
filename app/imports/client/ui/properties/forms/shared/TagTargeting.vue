<template lang="html">
  <div class="tag-targeting">
    <div class="d-flex align-center">
      <v-btn
        icon
        style="margin-top: -30px;"
        class="mr-2"
        :loading="addExtraTagsLoading"
        :disabled="extraTagsFull"
        @click="addExtraTags"
      >
        <v-icon>
          mdi-plus
        </v-icon>
      </v-btn>
      <smart-combobox
        label="Tags Required"
        :hint="tagHint"
        class="mb-2"
        multiple
        small-chips
        deletable-chips
        persistent-hint
        :value="model[tagField]"
        :error-messages="errors[tagField]"
        @change="change(tagField, ...arguments)"
      />
    </div>
    <v-slide-x-transition
      group
    >
      <div
        v-for="(extras, i) in model[extraTagsField]"
        :key="extras._id"
        class="target-tags layout align-center justify-space-between"
      >
        <smart-select
          label="Operation"
          style="width: 90px; flex-grow: 0;"
          :items="['OR', 'NOT']"
          :value="extras.operation"
          :error-messages="errors[extraTagsField] && errors[extraTagsField][i]"
          @change="change([extraTagsField, i, 'operation'], ...arguments)"
        />
        <smart-combobox
          label="Tags"
          :hint="extras.operation === 'OR' ? orHint : notHint"
          class="mx-2 mb-2"
          multiple
          small-chips
          deletable-chips
          persistent-hint
          :value="extras.tags"
          @change="change([extraTagsField, i, 'tags'], ...arguments)"
        />
        <v-btn
          icon
          style="margin-top: -30px;"
          @click="$emit('pull', {path: [extraTagsField, i]})"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </v-slide-x-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import propertySchemasIndex from '/imports/api/properties/computedPropertySchemasIndex';

const props = defineProps<{
  model: Record<string, any>;
  errors: Record<string, any>;
  tagField?: string;
  extraTagsField?: string;
  tagHint?: string;
  orHint?: string;
  notHint?: string;
}>();

const emit = defineEmits(['change', 'push']);

const addExtraTagsLoading = ref(false);

const maxTags = computed(() => {
  if (!props.model?.type) return 0;
  const schema = (propertySchemasIndex as any)[props.model.type];
  return schema.get(props.extraTagsField ?? 'extraTags', 'maxCount');
});

const extraTagsFull = computed(() => {
  const field = props.extraTagsField ?? 'extraTags';
  if (!props.model[field]) return false;
  return props.model[field].length >= maxTags.value;
});

function addExtraTags() {
  addExtraTagsLoading.value = true;
  const field = props.extraTagsField ?? 'extraTags';
  emit('push', {
    path: [field],
    value: {
      _id: Random.id(),
      operation: 'OR',
      tags: [],
    },
    ack: () => { addExtraTagsLoading.value = false; },
  });
}

function change(path: string | string[], value: any, ack?: Function) {
  const pathArray = Array.isArray(path) ? path : [path];
  emit('change', { path: pathArray, value, ack });
}
</script>
