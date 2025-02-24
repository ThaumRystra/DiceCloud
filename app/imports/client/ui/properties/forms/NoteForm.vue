<template lang="html">
  <div class="feature-form">
    <inline-computation-field
      :label="$t('ActionForm.uMqJz6So1tbWiONiw7coZ')"
      :hint="$t('NoteForm.yLE_TlDCIWHZ-_KI8GonN')"
      :model="model.summary"
      :error-messages="errors['summary.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['summary', ...path], value, ack})"
    />

    <inline-computation-field
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
      :hint="$t('NoteForm.d0G5fv7VU_--LV_KXToNH')"
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
