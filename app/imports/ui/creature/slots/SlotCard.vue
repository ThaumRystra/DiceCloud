<template>
  <v-card
    v-if="model"
    v-bind="$attrs"
    :data-id="`slot-card-${model._id}`"
    :style="`border: solid 1px ${accentColor};`"
    hover
    class="slot-card d-flex flex-column"
    style="max-width: 400px;"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @click="$emit('click')"
  >
    <card-highlight 
      :active="hover"
    />
    <v-card-title>
      {{ model.name }}
    </v-card-title>
    <v-card-text v-if="model.description">
      {{ model.description.value }}
    </v-card-text>
    <v-spacer />
    <v-card-actions>
      <v-spacer />
      <v-btn
        text
        color="primary"
        @click.stop="$emit('ignore')"
      >
        Skip
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="js">
import CardHighlight from '/imports/ui/components/CardHighlight.vue';

export default {
  components: {
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
      default: undefined,
    },
  },
  data(){ return {
    hover: false,
  }},
  computed: {
    accentColor(){
      if (this.theme.isDark){
        return this.$vuetify.theme.themes.dark.primary;
      } else {
        return this.$vuetify.theme.themes.light.primary;
      }
    }
  },
}
</script>
