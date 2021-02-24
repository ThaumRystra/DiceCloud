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
    if (this.$refs.focusFirst && this.$refs.focusFirst.focus){
      setTimeout(() => this.$refs.focusFirst.focus(), 300);
    }
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
