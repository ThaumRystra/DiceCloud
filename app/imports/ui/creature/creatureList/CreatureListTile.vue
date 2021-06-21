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
    <v-list-item-action>
      <shared-icon :model="model" />
    </v-list-item-action>
    <v-list-item-action>
      <v-checkbox
        v-if="selection"
        :input-value="selected && selected.has(model._id)"
        @change="$emit('select')"
      />
      <v-icon
        style="height: 100%; width: 40px; cursor: move;"
        class="handle"
      >
        mdi-drag
      </v-icon>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="js">
import SharedIcon from '/imports/ui/components/SharedIcon.vue';

export default {
  components: {
    SharedIcon,
  },
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
