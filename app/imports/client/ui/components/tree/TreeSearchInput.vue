<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import PROPERTIES from '/imports/constants/PROPERTIES';
import escapeRegex from '/imports/api/utility/escapeRegex';

const allFilterOptions = Object.keys(PROPERTIES as Record<string, { name: string }>).map(key => ({
  text: (PROPERTIES as Record<string, { name: string }>)[key].name,
  value: key,
}));

const props = defineProps<{
  value?: object;
  isLibrary?: boolean;
}>();

const emit = defineEmits<{
  input: [filter: object | undefined];
  'extra-fields-changed': [fields: string[]];
}>();

const typeFilterInput = ref<string[]>([]);
const fieldFilters = ref<{ field: string; value: string | undefined }[]>([{ field: 'name', value: undefined }]);
const menu = ref(false);

const filter = computed(() => {
  let f: Record<string, any> | undefined = undefined;
  if (typeFilterInput.value?.length) {
    f = f || {};
    f.type = { $in: typeFilterInput.value };
  }
  fieldFilters.value?.forEach(fieldFilter => {
    if (!fieldFilter.field || !fieldFilter.value) return;
    const search = { $regex: escapeRegex(fieldFilter.value), '$options': 'i' };
    f = f || {};
    if (fieldFilter.field.includes('.')) {
      f[fieldFilter.field] = search;
    } else {
      f.$and = f.$and || [];
      f.$and.push({
        $or: [
          { [fieldFilter.field]: search },
          { [fieldFilter.field + '.calculation']: search },
          { [fieldFilter.field + '.text']: search },
        ],
      });
    }
  });
  return f;
});

const filterOptions = computed(() => {
  return !props.isLibrary
    ? allFilterOptions.filter(p => p.value !== 'reference')
    : allFilterOptions;
});

const extraFields = computed(() => {
  const fields: string[] = [];
  fieldFilters.value?.forEach(fieldFilter => {
    if (!fieldFilter.field || !fieldFilter.value) return;
    fields.push(fieldFilter.field);
  });
  return fields;
});

const numFilters = computed(() => {
  let count = 0;
  if (typeFilterInput.value?.length) count += 1;
  count += extraFields.value.length;
  return count;
});

watch(menu, (val) => {
  if (!val) {
    emit('input', filter.value);
    emit('extra-fields-changed', extraFields.value);
  }
});
</script>

<template lang="html">
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <v-btn
       
        icon
        v-bind="props"
      >
        <v-badge
          :content="numFilters"
          :model-value="numFilters"
          color="primary"
          overlap
        >
          <v-icon>mdi-magnify</v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        Search
      </v-card-title>
      <v-card-text>
        <v-select
          v-model="typeFilterInput"
          variant="outlined"
          label="Type"
          :items="filterOptions"
          multiple
          clearable
          small-chips
          closable-chips
        />
        <v-slide-x-transition group>
          <div
            v-for="(fieldFilter, index) in fieldFilters"
            :key="index"
            class="d-flex"
          >
            <v-text-field
              v-model="fieldFilter.field"
              class="text--mono"
              label="Field"
              variant="outlined"
            />
            <v-text-field
              v-model="fieldFilter.value"
              label="Text"
              class="ml-2"
              variant="outlined"
            />
            <v-btn
              v-if="fieldFilters.length > 1"
              icon
              @click="fieldFilters.splice(index, 1)"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-slide-x-transition>
        <div
          v-if="fieldFilters.length < 5"
          class="d-flex"
        >
          <v-spacer />
          <v-btn
            icon
            @click="fieldFilters.push({name: '', value: undefined})"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
        <v-card-actions>
          <v-btn
            variant="text"
            prepend-icon="mdi-close"
            @click="
              fieldFilters = [{field: 'name', value: undefined}];
              typeFilterInput = [];
              menu = false;
            "
          >
            Clear
          </v-btn>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="menu = false"
          >
            Find
          </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<style lang="css" scoped>
</style>
