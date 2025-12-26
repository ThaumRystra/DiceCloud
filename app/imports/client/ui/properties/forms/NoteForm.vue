<template lang="html">
  <div class="feature-form">
    <inline-computation-field
      :label="$t('properties.forms.common.summary')"
      :hint="$t('properties.forms.noteForm.summaryHint')"
      :model="model.summary"
      :error-messages="errors['summary.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['summary', ...path], value, ack})"
    />

    <inline-computation-field
      :label="$t('properties.forms.common.description')"
      :hint="$t('properties.forms.noteForm.descriptionHint')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections
      v-if="$slots.default"
      type="note"
    >
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  mixins: [propertyFormMixin],
}
</script>
