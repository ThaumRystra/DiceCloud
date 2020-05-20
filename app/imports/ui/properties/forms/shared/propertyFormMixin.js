export default {
  props: {
    model: {
      type: Object,
      default: () => ({}),
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    change(path, value, ack){
      if (!Array.isArray(path)){
        path = [path];
      }
      this.$emit('change', {path, value, ack});
    }
  }
}
