<template
  lang="html"
  functional
>
  <component
    :is="model.type"
    v-if="model && components[model.type]"
  />
  <v-card v-else-if="model">
    <v-card-title class="text--error">
      A property card for the {{ model.type }} isn't defined. You should report this error.
    </v-card-title>
  </v-card>
</template>

<script lang="js">
import ActionCard from '/imports/client/ui/properties/components/actions/ActionCard.vue';

export default {
  components: {
    action: ActionCard,
  },
  props: {
    model: {
      type: Object,
      default: undefined,
    },
  },
}
</script>
