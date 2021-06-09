<template
  lang="html"
  functional
>
  <v-list-item v-bind="$attrs">
    <v-list-item-avatar :color="model.color || 'grey'">
      <img
        v-if="model.avatarPicture"
        :src="model.avatarPicture"
        :alt="model.name"
      >
      <template v-else>
        {{ model.initial }}
      </template>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{ model.name }}
      </v-list-item-title>
      <v-list-item-subtitle>
        {{ model.alignment }} {{ model.gender }} {{ model.race }}
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action v-if="selection">
      <v-checkbox
        :input-value="selected && selected.has(model._id)"
        @change="$emit('select')"
      />
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="js">
export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
    selection: Boolean,
    selected: {
      type: Set,
      default: () => new Set(),
    },
  }
}
</script>
