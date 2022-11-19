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
      <v-btn
        icon
        data-id="help-button"
        @click="helpDialog"
      >
        <v-icon>mdi-help</v-icon>
      </v-btn>
    </template>
    <component
      :is="type"
      v-if="type"
      class="library-node-form"
      :model="model"
      :errors="errors"
      @change="change"
      @push="push"
      @pull="pull"
    />
    <div
      slot="actions"
      class="layout justify-end"
    >
      <v-btn
        text
        :disabled="!valid"
        @click="$store.dispatch('popDialogStack', model)"
      >
        Insert
      </v-btn>
    </div>
  </dialog-base>
</template>

<script lang="js">
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import propertyFormIndex from '/imports/client/ui/properties/forms/shared/propertyFormIndex.js';
import schemaFormMixin from '/imports/client/ui/properties/forms/shared/schemaFormMixin.js';
import ColorPicker from '/imports/client/ui/components/ColorPicker.vue';
import propertySchemasIndex from '/imports/api/properties/propertySchemasIndex.js';
import PROPERTIES from '/imports/constants/PROPERTIES.js';

export default {
  components: {
    ...propertyFormIndex,
    DialogBase,
    ColorPicker,
  },
  mixins: [schemaFormMixin],
  props: {
    propertyName: {
      type: String,
      default: undefined,
    },
    type: {
      type: String,
      default: undefined,
    },
  },
  reactiveProvide: {
    name: 'context',
    include: ['debounceTime', 'isLibraryForm'],
  },
  data() {
    return {
      model: {
        type: this.type,
      },
      schema: undefined,
      validationContext: undefined,
      debounceTime: 0,
      isLibraryForm: true,
    };
  },
  computed: {
    docsPath() {
      const propDef = PROPERTIES[this.type];
      return propDef && propDef.docsPath;
    },
  },
  watch: {
    type(newType) {
      if (!newType) return;
      this.schema = propertySchemasIndex[newType];
      this.validationContext = this.schema.newContext();
      let model = this.schema.clean({});
      model.type = newType;
      this.model = model;
    },
  },
  methods: {
    helpDialog() {
      this.$store.commit('pushDialogStack', {
        component: 'help-dialog',
        elementId: 'help-button',
        data: {
          path: this.docsPath,
        },
      });
    },
  }
}
</script>

<style lang="css" scoped>

</style>
