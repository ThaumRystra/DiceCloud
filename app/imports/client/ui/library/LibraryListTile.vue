<template
  lang="html"
  functional
>
  <v-list-item
    v-bind="$attrs"
    :class="(isSelected || selectedByCollection) && !disabled && 'primary--text v-list-item--active'"
    :to="selection ? undefined : to"
    @click="singleSelect && $emit('select')"
  >
    <v-list-item-action
      v-if="selection && !singleSelect"
    >
      <v-checkbox
        :disabled="disabled"
        :input-value="disabled || isSelected"
        :off-icon="selectedByCollection ? 'mdi-checkbox-intermediate' : undefined"
        @change="e => $emit('select', e)"
        @click.stop
      />
    </v-list-item-action>
    <v-list-item-avatar v-else>
      <shared-icon :model="model" />
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{ model.name }}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="js" functional>
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
    singleSelect: Boolean,
    isSelected: Boolean,
    selectedByCollection: Boolean,
    disabled: Boolean,
    to: {
      type: Object,
      required: true,
    }
  }
}
</script>
