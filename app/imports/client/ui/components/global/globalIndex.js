// Global components
import DatePicker from '/imports/client/ui/components/global/DatePicker.vue';
import DragHandle from '/imports/client/ui/components/global/DragHandle.vue';
import IconPicker from '/imports/client/ui/components/global/IconPicker.vue';
import TextField from '/imports/client/ui/components/global/TextField.vue';
import TextArea from '/imports/client/ui/components/global/TextArea.vue';
import SmartSelect from '/imports/client/ui/components/global/SmartSelect.vue';
import SmartBtn from '/imports/client/ui/components/global/SmartBtn.vue';
import SmartCombobox from '/imports/client/ui/components/global/SmartCombobox.vue';
import SmartCheckbox from '/imports/client/ui/components/global/SmartCheckbox.vue';
import SmartSwitch from '/imports/client/ui/components/global/SmartSwitch.vue';
import SmartToggle from '/imports/client/ui/components/global/SmartToggle.vue';
import SvgIcon from '/imports/client/ui/components/global/SvgIcon.vue';
import SmartSlider from '/imports/client/ui/components/global/SmartSlider.vue';
// Shared property viewer components
import PropertyName from '/imports/client/ui/properties/viewers/shared/PropertyName.vue';
import PropertyVariableName from '/imports/client/ui/properties/viewers/shared/PropertyVariableName.vue';
import PropertyField from '/imports/client/ui/properties/viewers/shared/PropertyField.vue';
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';
import PropertyTags from '/imports/client/ui/properties/viewers/shared/PropertyTags.vue';
import PropertyTargetTags from '/imports/client/ui/properties/viewers/shared/PropertyTargetTags.vue';
// Shared property form components
import ComputedField from '/imports/client/ui/properties/forms/shared/ComputedField.vue';
import InlineComputationField from '/imports/client/ui/properties/forms/shared/InlineComputationField.vue';
import FormSection from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import { FormSections } from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import CalculationErrorList from '/imports/client/ui/properties/forms/shared/CalculationErrorList.vue';

export function registerGlobalComponents(app) {
  app.component('DatePicker', DatePicker);
  app.component('DragHandle', DragHandle);
  app.component('IconPicker', IconPicker);
  app.component('TextField', TextField);
  app.component('TextArea', TextArea);
  app.component('SmartSelect', SmartSelect);
  app.component('SmartBtn', SmartBtn);
  app.component('SmartCombobox', SmartCombobox);
  app.component('SmartCheckbox', SmartCheckbox);
  app.component('SmartSlider', SmartSlider);
  app.component('SmartSwitch', SmartSwitch);
  app.component('SmartToggle', SmartToggle);
  app.component('SvgIcon', SvgIcon);
  // Property viewer shared components
  app.component('PropertyName', PropertyName);
  app.component('PropertyVariableName', PropertyVariableName);
  app.component('PropertyField', PropertyField);
  app.component('PropertyDescription', PropertyDescription);
  app.component('PropertyTags', PropertyTags);
  app.component('PropertyTargetTags', PropertyTargetTags);
  // Property form shared components
  app.component('ComputedField', ComputedField);
  app.component('InlineComputationField', InlineComputationField);
  app.component('FormSection', FormSection);
  app.component('FormSections', FormSections);
  app.component('CalculationErrorList', CalculationErrorList);
}
