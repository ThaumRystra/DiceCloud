<template lang="html">
  <svg-icon
    :shape="shape"
  />
</template>

<script>
import SvgIcon from '/imports/ui/components/global/SvgIcon.vue'
import SVG_ICONS from '/imports/constants/SVG_ICONS.js';

export default {
  components: {
    SvgIcon,
  },
  props: {
    name: {
      type: String,
      required: true,
    }
  },
  computed: {
    shape(){
      return SVG_ICONS[this.name].shape;
    }
  }
}
</script>

<style lang="css" scoped>
</style>
