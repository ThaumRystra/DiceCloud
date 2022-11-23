<template>
  <v-list-item
    :to="doc.href"
    style="min-width: 180px;"
  >
    <v-list-item-avatar v-if="icon">
      <svg-icon
        v-if="doc && doc.icon"
        :shape="doc.icon.shape"
      />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{ doc.name }}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="js">
export default {
  props: { 
    doc: {
      type: Object,
      required: true,
    },
    icon: Boolean,
  },
}
</script>
