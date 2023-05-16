<template lang="html">
  <div class="tag-targeting">
    <v-layout
      align-center
    >
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
        hint="Applied to properties that have all the listed tags"
        class="mb-2"
        multiple
        small-chips
        deletable-chips
        persistent-hint
        :value="model.targetTags"
        :error-messages="errors.targetTags"
        @change="change('targetTags', ...arguments)"
      />
    </v-layout>
    <v-slide-x-transition
      group
    >
      <div
        v-for="(extras, i) in model.extraTags"
        :key="extras._id"
        class="target-tags layout align-center justify-space-between"
      >
        <smart-select
          label="Operation"
          style="width: 90px; flex-grow: 0;"
          :items="['OR', 'NOT']"
          :value="extras.operation"
          :error-messages="errors.extraTags && errors.extraTags[i]"
          @change="change(['extraTags', i, 'operation'], ...arguments)"
        />
        <smart-combobox
          label="Tags"
          :hint="extras.operation === 'OR' ? 'Also applied to properties that have all of these tags' : 'Ignore properties that have any of these tags'"
          class="mx-2 mb-2"
          multiple
          small-chips
          deletable-chips
          persistent-hint
          :value="extras.tags"
          @change="change(['extraTags', i, 'tags'], ...arguments)"
        />
        <v-btn
          icon
          style="margin-top: -30px;"
          @click="$emit('pull', {path: ['extraTags', i]})"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </v-slide-x-transition>
  </div>
</template>

<script lang="js">
import propertySchemasIndex from '/imports/api/properties/computedPropertySchemasIndex.js';

export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
    errors: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      addExtraTagsLoading: false,
    }
  },
  computed: {
    maxTags() {
      if (!this.model?.type) return 0;
      const schema = propertySchemasIndex[this.model.type];
      return schema.get('extraTags', 'maxCount');
    },
    extraTagsFull() {
      if (!this.model.extraTags) return false;
      return this.model.extraTags.length >= this.maxTags;
    },
  },
  methods: {
    addExtraTags() {
      this.addExtraTagsLoading = true;
      this.$emit('push', {
        path: ['extraTags'],
        value: {
          _id: Random.id(),
          operation: 'OR',
          tags: [],
        },
        ack: () => this.addExtraTagsLoading = false,
      });
    },
    change(path, value, ack) {
      if (!Array.isArray(path)) {
        path = [path];
      }
      this.$emit('change', { path, value, ack });
    },
  },
}
</script>