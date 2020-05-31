<template lang="html">
  <dialog-base
    :override-back-button="() => $emit('back')"
    :color="model.color"
  >
    <template slot="toolbar">
      <v-toolbar-title>
        Add {{ propertyName }}
      </v-toolbar-title>
      <v-spacer />
      <color-picker
        :value="model.color"
        @input="value => change({path: ['color'], value})"
      />
    </template>
    <component
      :is="type"
      v-if="type"
      class="creature-property-form"
      :model="model"
      :errors="errors"
      @change="change"
      @push="push"
      @pull="pull"
    />
    <div
      slot="actions"
      class="layout row justify-end"
    >
      <v-btn
        flat
        :disabled="!valid"
        @click="$store.dispatch('popDialogStack', model)"
      >
        Insert
      </v-btn>
    </div>
  </dialog-base>
</template>

<script>
import propertySchemasIndex from '/imports/api/properties/propertySchemasIndex.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import propertyFormIndex from '/imports/ui/properties/forms/shared/propertyFormIndex.js';
import ColorPicker from '/imports/ui/components/ColorPicker.vue';
import schemaFormMixin from '/imports/ui/properties/forms/shared/schemaFormMixin.js';

export default {
	components: {
		...propertyFormIndex,
		DialogBase,
    ColorPicker,
	},
	mixins: [schemaFormMixin],
	props: {
		propertyName: String,
		type: String,
	},
  reactiveProvide: {
    name: 'context',
    include: ['debounceTime'],
  },
	data(){return {
		model: {
			type: this.type,
		},
		schema: undefined,
		validationContext: undefined,
    debounceTime: 0,
	};},
	watch: {
		type(newType){
			if (!newType) return;
			this.schema = propertySchemasIndex[newType];
			this.validationContext = this.schema.newContext();
			let model = this.schema.clean({});
			model.type = newType;
			this.model = model;
		},
	},
}
</script>

<style lang="css" scoped>
</style>
