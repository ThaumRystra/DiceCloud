import Vue from "vue";
// Global components
import TextField from '/imports/ui/components/global/TextField.vue';
import TextArea from '/imports/ui/components/global/TextArea.vue';
import SmartSelect from '/imports/ui/components/global/SmartSelect.vue';

Vue.component("text-field", TextField);
Vue.component("text-area", TextArea);
Vue.component("smart-select", SmartSelect);
