import Vue from "vue";
// Global components
import DatePicker from '/imports/ui/components/global/DatePicker.vue';
import TextField from '/imports/ui/components/global/TextField.vue';
import TextArea from '/imports/ui/components/global/TextArea.vue';
import SmartSelect from '/imports/ui/components/global/SmartSelect.vue';

Vue.component("date-picker", DatePicker);
Vue.component("text-field", TextField);
Vue.component("text-area", TextArea);
Vue.component("smart-select", SmartSelect);
