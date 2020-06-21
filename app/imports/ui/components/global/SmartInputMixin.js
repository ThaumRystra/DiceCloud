/*
 * Mixin to handle inputs that update the database.
 * Won't bash the field's value while it's focused, even if the database trims
 * or otherwise sanitizes the data captured.
 *
 * Emits a change event that requires acknowledgement with an optional error
 * message if something went wrong
 */
import { debounce } from 'lodash';

export default {
  inject: {
    context: { default: {} }
  },
  inheritAttrs: false,
  data(){ return {
    error: false,
    ackErrors: null,
    focused: false,
    loading: false,
    dirty: false,
    safeValue: this.value,
    inputValue: this.value,
  };},
  props: {
    value: [String, Number, Date, Array, Object, Boolean],
    errorMessages: [String, Array],
    disabled: Boolean,
  },
  watch: {
    focused(newFocus){
      // If the value updated while we were focused, show it now on defocus
      // but not if we are waiting for our own writes to get persisted
      // and not if there is an error in our input
      if (!newFocus && !this.dirty && !this.error){
        this.forceSafeValueUpdate();
      }
      // Start the loading bar on defocus if the input is dirty
      // It might be a lie, we aren't doing the work yet, but it feels laggy
      // to defocus an element and then it starts working after a delay
      if (!newFocus && this.dirty){
        if (this.hasChangeListener) this.loading = true;
      }
    },
    dirty(newDirty){
      // Our changes were acknowledged, weren't in error, and we aren't focused,
      // make sure the internal value matches the database value
      if (!newDirty && !this.focused && !this.error){
        this.forceSafeValueUpdate();
      }
    },
    value(newValue){
      if (!this.focused){
        this.safeValue = newValue;
      }
    },
    safeValue(){
      // The safe value only gets updated from the parent, so it must be valid
      this.error = false;
      this.ackErrors = null;
    },
  },
  methods: {
    input(val){
      this.$emit('input', val);
      this.inputValue = val;
      this.dirty = true;
      this.debouncedChange(val);
    },
    acknowledgeChange(error){
      this.loading = false;
      this.dirty = false;
      this.error = !!error;
			if (!error){
				this.ackErrors = null;
			} else if (typeof error === 'string'){
				this.ackErrors = error;
			} else if (error.reason){
        this.ackErrors = error.reason;
      } else {
				this.ackErrors = 'Something went wrong'
				console.error(error);
			}
    },
    change(val){
      this.dirty = true;
      if (this.hasChangeListener) this.loading = true;
      this.$emit('change', val, this.acknowledgeChange);
    },
    hasChangeListener(){
      return this.$listeners && this.$listeners.change;
    },
    forceSafeValueUpdate(){
      // hack to force the value to update on the child component
      this.safeValue = null;
      this.$nextTick(() => this.safeValue = this.value);
    },
    focus(){
      this.$refs.input.focus();
    }
  },
  computed: {
    errors(){
      let errors = this.ackErrors ? [this.ackErrors] : [];
      if (Array.isArray(this.errorMessages)){
        errors.push(...this.errorMessages);
      } else if (typeof this.errorMessages === 'string' && this.errorMessages){
        errors.push(this.errorMessages);
      }
      return errors;
    },
    isDisabled(){
      return this.context.editPermission === false || this.disabled;
    },
    debounceTime() {
      if (Number.isFinite(this.context.debounceTime)){
        return this.context.debounceTime;
      } else {
        return 750;
      }
    },
  },
  created(){
    this.debouncedChange = debounce(this.change, this.debounceTime);
  },
  beforeDestroy(){
    this.debouncedChange.flush();
  },
};
