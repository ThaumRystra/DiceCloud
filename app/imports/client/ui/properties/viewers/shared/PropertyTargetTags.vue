<script setup lang="ts">
defineProps<{
  model: Record<string, any>;
}>();
</script>

<template lang="html">
  <property-field
    v-if="model.targetByTags"
    name="Targeted tags"
  >
    <div 
      class="py-1"
    >
      <div class="d-flex flex-wrap">
        <v-chip
          v-for="(tag, index) in model.targetTags"
          :key="index"
          class="mr-1"
          disabled
          size="small"
        >
          {{ tag }}
        </v-chip>
      </div>
      <div
        v-for="ex in model.extraTags"
        :key="ex._id"
      >
        <span class="ma-2">
          {{ ex.operation }}
        </span>
        <div class="d-flex flex-wrap">
          <v-chip
            v-for="(extraTag, index) in ex.tags"
            :key="index"
            class="mr-1"
            disabled
            size="small"
          >
            {{ extraTag }}
          </v-chip>
        </div>
      </div>
    </div>
  </property-field>
</template>
