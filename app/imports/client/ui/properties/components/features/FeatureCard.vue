<template lang="html">
  <toolbar-card
    :id="model._id"
    :color="model.color"
    @toolbarclick="$emit('click')"
  >
    <template slot="toolbar">
      <v-toolbar-title>
        <property-icon v-if="model.icon"
          class="mr-2"
          :model="model"
          :color="model.color"
        />
        {{ model.name }}
      </v-toolbar-title>
      <v-spacer />
    </template>
    <v-card-text v-if="summaryText">
      <property-description
        text
        :model="model.summary"
      />
    </v-card-text>
  </toolbar-card>
</template>

<script lang="js">
import ToolbarCard from '/imports/client/ui/components/ToolbarCard.vue';
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue'
import PropertyIcon from '/imports/client/ui/properties/shared/PropertyIcon.vue';

export default {
  components: {
    ToolbarCard,
    PropertyDescription,
    PropertyIcon,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    summaryText() {
      if (!this.model || !this.model.summary) return;
      if (typeof this.model.summary.value === 'string') {
        return this.model.summary.value;
      } else {
        return this.model.summary.text
      }
    },
  }
};
</script>

<style lang="css" scoped>
</style>
