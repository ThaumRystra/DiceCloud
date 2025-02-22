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
      {{ $t('PropertyCard.WKBCFII37aVYuOOkwgY6F', [model.type]) }}
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
