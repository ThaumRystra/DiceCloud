<template lang="html">
  <div
    class="d-flex justify-center flex-wrap"
  >
    <div class="mx-1">
      <color-picker
        label="Color"
        :value="model.color"
        @input="value =>$emit('change', {path: ['color'], value})"
      />
    </div>
    <div class="mx-1">
      <icon-picker
        label="Icon"
        :value="model.icon"
        :error-messages="errors.icon"
        @change="(value, ack) =>$emit('change', {path: ['icon'], value, ack})"
      />
    </div>
  </div>
</template>

<script lang="js">
  import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';
  import ColorPicker from '/imports/ui/components/ColorPicker.vue';

  export default {
    components: {
      PropertyIcon,
      ColorPicker,
    },
    props: {
      model: {
        type: Object,
        required: true,
      },
      errors: {
        type: Object,
        required: true,
      },
    },
  }
</script>

<style lang="css" scoped>
</style>
