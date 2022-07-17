<template
  lang="html"
  functional
>
  <v-list-item
    v-bind="$attrs"
    :class="isSelected && 'primary--text v-list-item--active'"
  >
    <v-list-item-avatar>
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
    isSelected: Boolean,
    dense: Boolean,
  }
}
</script>
