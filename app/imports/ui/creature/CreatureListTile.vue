<template
  lang="html"
  functional
>
  <v-list-tile v-bind="$attrs">
    <v-list-tile-avatar :color="model.color || 'grey'">
      <img
        v-if="model.avatarPicture"
        :src="model.avatarPicture"
        :alt="model.name"
      >
      <template v-else>
        {{ model.initial }}
      </template>
    </v-list-tile-avatar>
    <v-list-tile-content>
      <v-list-tile-title>
        {{ model.name }}
      </v-list-tile-title>
      <v-list-tile-sub-title>
        {{ model.alignment }} {{ model.gender }} {{ model.race }}
      </v-list-tile-sub-title>
    </v-list-tile-content>
    <v-list-tile-action v-if="selection">
      <v-checkbox
        :input-value="selected && selected.has(model._id)"
        @change="$emit('select')"
      />
    </v-list-tile-action>
  </v-list-tile>
</template>

<script type="text/javascript">
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
