<template>
  <div class="class-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          ref="focusFirst"
          label="Name"
          :value="model.name"
          :error-messages="errors.name"
          @change="change('name', ...arguments)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Variable name"
          :value="model.variableName"
          hint="Use this name in calculations to reference this class"
          :error-messages="errors.variableName"
          @change="change('variableName', ...arguments)"
        />
      </v-col>
    </v-row>

    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors.description"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-sections>
      <form-section
        v-if="$slots.children"
        name="Children"
      >
        <slot name="children" />
      </form-section>

      <form-section name="Advanced">
        <smart-combobox
          label="Tags"
          hint="This class's own tags"
          multiple
          chips
          deletable-chips
          :value="model.tags"
          @change="change('tags', ...arguments)"
        />
        <v-layout align-center>
          <v-btn
            icon
            style="margin-top: -30px;"
            class="mr-2"
            :loading="addExtraTagsLoading"
            :disabled="extraTagsFull"
            @click="addExtraTags"
          >
            <v-icon>
              mdi-plus
            </v-icon>
          </v-btn>
          <smart-combobox
            label="Tags Required"
            hint="Class levels added to this class must have these tags"
            multiple
            chips
            deletable-chips
            :value="model.slotTags"
            :error-messages="errors.slotTags"
            @change="change('slotTags', ...arguments)"
          />
        </v-layout>
        <v-slide-x-transition group>
          <div
            v-for="(extras, i) in model.extraTags"
            :key="extras._id"
            class="extra-tags layout align-center justify-space-between"
          >
            <smart-select
              label="Operation"
              style="width: 90px; flex-grow: 0;"
              :items="extraTagOperations"
              :value="extras.operation"
              :error-messages="errors.extraTags && errors.extraTags[i]"
              @change="change(['extraTags', i, 'operation'], ...arguments)"
            />
            <smart-combobox
              label="Tags"
              :hint="extras.operation === 'OR' ? 'The class levels can have these tags instead' : 'The class levels can not have any of these tags'"
              class="mx-2"
              multiple
              chips
              deletable-chips
              :value="extras.tags"
              @change="change(['extraTags', i, 'tags'], ...arguments)"
            />
            <v-btn
              icon
              style="margin-top: -30px;"
              @click="$emit('pull', {path: ['extraTags', i]})"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </v-slide-x-transition>

        <computed-field
          label="Condition"
          hint="A caclulation to determine if this class can have levels added to it"
          placeholder="Always allow"
          :model="model.slotCondition"
          :error-messages="errors.slotCondition"
          @change="({path, value, ack}) =>
            $emit('change', {path: ['slotCondition', ...path], value, ack})"
        />
      </form-section>
    </form-sections>
  </div>
</template>

<script>
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';
import FormSection from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import PROPERTIES from '/imports/constants/PROPERTIES.js';
import { SlotSchema } from '/imports/api/properties/Slots.js';

export default {
  components: {
    FormSection,
  },
  mixins: [propertyFormMixin],
  inject: {
    context: { default: {} }
  },
  props: {
    classForm: Boolean,
  },
  data() {
    let slotTypes = [];
    for (let key in PROPERTIES) {
      slotTypes.push({ text: PROPERTIES[key].name, value: key });
    }
    return {
      slotTypes,
      addExtraTagsLoading: false,
      extraTagOperations: ['OR', 'NOT'],
    };
  },
  computed: {
    extraTagsFull() {
      if (!this.model.extraTags) return false;
      let maxCount = SlotSchema.get('extraTags', 'maxCount');
      return this.model.extraTags.length >= maxCount;
    }
  },
  methods: {
    acknowledgeAddResult() {
      this.addExtraTagsLoading = false;
    },
    addExtraTags() {
      this.addExtraTagsLoading = true;
      this.$emit('push', {
        path: ['extraTags'],
        value: {
          _id: Random.id(),
          operation: 'OR',
          tags: [],
        },
        ack: this.acknowledgeAddResult,
      });
    },
  },
};
</script>
