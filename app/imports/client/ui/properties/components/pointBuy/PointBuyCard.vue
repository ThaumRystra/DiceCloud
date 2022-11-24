<template>
  <v-card
    v-if="model"
    v-bind="$attrs"
    :data-id="`point-buy-card-${model._id}`"
    :style="`border: solid 1px ${accentColor};`"
    hover
    class="slot-card d-flex flex-column"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @click="$emit('click')"
  >
    <card-highlight 
      :active="hover"
    />
    <v-card-title>
      {{ model.name || 'Point Buy' }}
    </v-card-title>
    <v-card-text>
      {{ model.spent }}
      <template v-if="model.total && (typeof model.total.value === 'number')">
        / {{ model.total && model.total.value }}
      </template>
    </v-card-text>
    <v-spacer />
    <v-card-actions>
      <v-spacer />
      <v-btn
        icon
        color="accent"
        @click.stop="$emit('ignore')"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="js">
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';

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
