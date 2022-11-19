<template
  lang="html"
  functional
>
  <v-list-item
    v-bind="$attrs"
    :class="isSelected && 'primary--text v-list-item--active'"
    v-on="selection ? { click() {$emit('click')} } : {}"
  >
    <v-list-item-avatar
      :color="isSelected ? 'red darken-1' : model.color || 'grey'"
      class="white--text"
      style="transition: background 0.3s;"
    >
      <v-fade-transition leave-absolute>
        <v-icon v-if="isSelected">
          mdi-check
        </v-icon>
        <img
          v-else-if="model.avatarPicture"
          :src="model.avatarPicture"
          :alt="model.name"
        >
        <template v-else>
          <span>
            {{ model.initial }}
          </span>
        </template>
      </v-fade-transition>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{ model.name }}
      </v-list-item-title>
      <v-list-item-subtitle v-if="!dense">
        {{ model.alignment }} {{ model.gender }} {{ model.race }}
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action v-if="!dense">
      <shared-icon :model="model" />
    </v-list-item-action>
    <v-list-item-action v-if="!selection && !dense">
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
import SharedIcon from '/imports/client/ui/components/SharedIcon.vue';

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
    isSelected: Boolean,
    dense: Boolean,
  }
}
</script>
