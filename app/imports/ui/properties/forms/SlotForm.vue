<template lang="html">
  <div class="slot-form">
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <smart-select
      label="Type"
      style="flex-basis: 300px;"
      clearable
      hint="What property type is needed to fill this slot"
      :items="slotTypes"
      :value="model.slotType"
      :error-messages="errors.slotType"
      @change="change('slotType', ...arguments)"
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
        hint="The slot must be filled with a property which has all the listed tags"
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
          :hint="extras.operation === 'OR' ? 'The slot can be filled with a property that has all of these tags instead' : 'The slot cannot be filled with a property that has any of these tags'"
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
      label="Quantity"
      hint="How many matching properties must be used to fill this slot, 0 is unlimited"
      :model="model.quantityExpected"
      :error-messages="errors.quantityExpected"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['quantityExpected', ...path], value, ack})"
    />

    <computed-field
      label="Condition"
      hint="A caclulation to determine if this slot should be active"
      placeholder="Always active"
      :model="model.slotCondition"
      :error-messages="errors.slotCondition"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['slotCondition', ...path], value, ack})"
    />

    <smart-select
      label="Unique"
      style="flex-basis: 300px;"
      clearable
      hint="Do the properties that fill this slot need to be unique?"
      :items="uniqueOptions"
      :value="model.unique"
      :error-messages="errors.unique"
      @change="change('unique', ...arguments)"
    />

    <v-layout justify-center>
      <v-btn
        v-if="context.isLibraryForm"
        color="accent"
        class="ma-2 mb-4"
        data-id="test-slot-button"
        @click="testSlot"
      >
        Test Slot
      </v-btn>
    </v-layout>

    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors.description"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />

    <form-section
      name="Advanced"
      standalone
    >
      <div class="layout wrap justify-space-between">
        <smart-switch
          label="Hide when full"
          style="width: 200px; flex-grow: 0;"
          class="mx-2"
          :value="model.hideWhenFull"
          :error-messages="errors.hideWhenFull"
          @change="change('hideWhenFull', ...arguments)"
        />
        <smart-switch
          label="Ignored"
          style="width: 200px; flex-grow: 0;"
          class="mx-2"
          :value="model.ignored"
          :error-messages="errors.ignored"
          @change="change('ignored', ...arguments)"
        />
      </div>
      <smart-combobox
        label="Tags"
        hint="This slot's own tags which will be used to fill other slots"
        multiple
        chips
        deletable-chips
        :value="model.tags"
        @change="change('tags', ...arguments)"
      />
    </form-section>
  </div>
</template>

<script lang="js">
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
  import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';
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
    data(){
      let slotTypes = [];
      for (let key in PROPERTIES){
         slotTypes.push({text: PROPERTIES[key].name, value: key});
      }
      return {
        slotTypes,
        addExtraTagsLoading: false,
        extraTagOperations: ['OR', 'NOT'],
        uniqueOptions: [{
          text: 'Each property inside this slot should be unique',
          value: 'uniqueInSlot',
        }, {
          text: 'Properties in this slot should be unique across the whole character',
          value: 'uniqueInCreature',
        }],
      };
    },
    computed: {
      extraTagsFull(){
        if (!this.model.extraTags) return false;
        let maxCount = SlotSchema.get('extraTags', 'maxCount');
        return this.model.extraTags.length >= maxCount;
      }
    },
    methods: {
			acknowledgeAddResult(){
				this.addExtraTagsLoading = false;
			},
      addExtraTags(){
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
      testSlot(){
        if (!this.context.isLibraryForm) return;
        this.$store.commit('pushDialogStack', {
          component: 'slot-fill-dialog',
          elementId: 'test-slot-button',
          data: {
            dummySlot: this.model,
          },
        });
      }
		},
	};
</script>
