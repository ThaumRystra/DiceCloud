<template lang="html">
  <div
    class="d-flex flex-wrap align-start"
  >
    <outlined-input
      name="Icon"
      class="mb-4"
    >
      <icon-picker
        :value="model.icon"
        :width="54"
        :height="54"
        @change="(value, ack) =>$emit('change', {path: ['icon'], value, ack})"
      />
    </outlined-input>
    <outlined-input
      name="Color"
      class="mb-4 ml-2"
    >
      <color-picker
        :value="model.color"
        :width="54"
        :height="54"
        @input="value =>$emit('change', {path: ['color'], value})"
      />
    </outlined-input>
  </div>
</template>

<script lang="js">
  import ColorPicker from '/imports/client/ui/components/ColorPicker.vue';
  import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';

  export default {
    components: {
      OutlinedInput,
      ColorPicker,
    },
    props: {
      model: {
        type: Object,
        required: true,
      },
    },
  }
</script>

<style lang="css" scoped>
</style>
