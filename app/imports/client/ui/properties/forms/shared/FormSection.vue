<template lang="html">
  <form-sections v-if="standalone">
    <v-expansion-panel>
      <v-expansion-panel-header>
        {{ name }}
      </v-expansion-panel-header>
      <v-expansion-panel-content class="pt-4">
        <slot />
      </v-expansion-panel-content>
    </v-expansion-panel>
  </form-sections>
  <v-expansion-panel v-else>
    <v-expansion-panel-header>
      {{ name }}
    </v-expansion-panel-header>
    <v-expansion-panel-content class="pt-4">
      <slot />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="js">
import FormSections from '/imports/client/ui/properties/forms/shared/FormSections.vue';
export default {
  components: {
    FormSections,
  },
  props: {
    name: {
      type: String,
      default: '',
    },
    standalone: Boolean,
  },
}
export { FormSections };
</script>
