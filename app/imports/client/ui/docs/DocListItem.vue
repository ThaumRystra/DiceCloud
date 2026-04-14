<script setup lang="ts">
defineProps<{
  doc: object;
  icon?: boolean;
}>();
</script>

<template>
  <v-list-item
    :to="doc.href"
    style="min-width: 180px;"
  >
    <template
      v-if="icon"
      #prepend
    >
      <v-avatar>
        <svg-icon
          v-if="doc && doc.icon"
          :shape="doc.icon.shape"
        />
      </v-avatar>
    </template>
    <v-list-item-title>
      {{ doc.name }}
    </v-list-item-title>
  </v-list-item>
</template>
