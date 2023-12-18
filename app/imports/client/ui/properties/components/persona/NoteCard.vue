<template lang="html">
  <v-card
    :color="model.color"
    :data-id="model._id"
    hover
    :dark="model.color && isDark"
    :light="model.color && !isDark"
    @click="clickProperty(model._id)"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    <v-card-title class="text-h6">
      {{ model.name }}
    </v-card-title>
    <v-card-text v-if="model.summary">
      <property-description
        text
        :model="model.summary"
      />
    </v-card-text>
    <card-highlight
      :active="hover"
      :dark="theme.isDark"
    />
  </v-card>
</template>

<script lang="js">
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';
import isDarkColor from '/imports/client/ui/utility/isDarkColor';
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';

export default {
  components: {
    PropertyDescription,
    CardHighlight,
  },
  inject: {
    theme: {
      default: {
        isDark: false,
      },
    },
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      hover: false,
    }
  },
  computed: {
    isDark() {
      return isDarkColor(this.model.color);
    },
  },
  methods: {
    clickProperty(_id) {
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `${_id}`,
        data: { _id },
      });
    },
  },
};
</script>

<style lang="css" scoped>

</style>
