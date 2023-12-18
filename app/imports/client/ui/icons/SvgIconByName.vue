<template lang="html">
  <svg-icon
    :shape="shape"
  />
</template>

<script lang="js">
import SvgIcon from '/imports/client/ui/components/global/SvgIcon.vue'
import SVG_ICONS from '/imports/constants/SVG_ICONS';

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
