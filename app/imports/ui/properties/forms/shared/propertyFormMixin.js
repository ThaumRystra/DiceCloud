export default {
  props: {
    model: {
      type: [Object, Array],
      default: () => ({}),
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
  },
  mounted(){
    // Don't autofocus on mobile, it brings up the on-screen keyboard
    if (this.$vuetify.breakpoint.smAndDown) return;

    setTimeout(() => {
      if (this.$refs.focusFirst && this.$refs.focusFirst.focus){
        this.$refs.focusFirst.focus()
      }
    }, 300);
  },
  methods: {
    change(path, value, ack){
      if (!Array.isArray(path)){
        path = [path];
      }
      this.$emit('change', {path, value, ack});
    }
  },
}
