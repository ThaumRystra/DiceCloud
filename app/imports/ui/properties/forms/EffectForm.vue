<template lang="html">
  <div class="effect-form">
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <smart-select
      label="Operation"
      append-icon="mdi-menu-down"
      :hint="operationHint"
      :error-messages="errors.operation"
      :menu-props="{transition: 'slide-y-transition', lazy: true}"
      :items="operations"
      :value="model.operation"
      @change="change('operation', ...arguments)"
    >
      <v-icon
        slot="prepend-inner"
        class="icon ml-0"
        :class="iconClass"
      >
        {{ displayedIcon }}
      </v-icon>
      <template
        slot="item"
        slot-scope="item"
      >
        <v-icon
          class="icon mr-2"
        >
          {{ getEffectIcon(item.item.value, 1) }}
        </v-icon>
        {{ item.item.text }}
      </template>
    </smart-select>
    <text-field
      v-if="model.operation === 'conditional'"
      label="Text"
      hint="The text to display on the affected stats"
      :value="model.text"
      :error-messages="errors.text"
      @change="change('text', ...arguments)"
    />
    <computed-field
      v-else
      label="Value"
      hint="Number or calculation to determine the value of this effect"
      :persistent-hint="needsValue"
      :disabled="!needsValue"
      :model="model.amount"
      :error-messages="errors.amount"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['amount', ...path], value, ack})"
    />
    <v-btn-toggle
      mandatory
      :value="radioGroup"
      class="ma-2 mb-8"
      @change="changeTargetByTags"
    >
      <v-btn value="stats">
        Target stats by variable name
      </v-btn>
      <v-btn value="tags">
        Target properties by tag
      </v-btn>
    </v-btn-toggle>

    <smart-combobox
      v-if="!model.targetByTags"
      label="Stats"
      class="mr-2"
      multiple
      chips
      deletable-chips
      hint="Which stats will this effect apply to"
      persistent-hint
      :value="model.stats"
      :items="attributeList"
      :error-messages="errors.stats"
      @change="change('stats', ...arguments)"
    />
    <v-layout
      v-if="model.targetByTags"
      align-center
    >
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
        hint="The effect will apply to properties that have all the listed tags"
        multiple
        chips
        deletable-chips
        persistent-hint
        :value="model.targetTags"
        :error-messages="errors.targetTags"
        @change="change('targetTags', ...arguments)"
      />
    </v-layout>
    <v-slide-x-transition
      v-if="model.targetByTags"
      group
    >
      <div
        v-for="(extras, i) in model.extraTags"
        :key="extras._id"
        class="target-tags layout align-center justify-space-between"
      >
        <smart-select
          label="Operation"
          style="width: 90px; flex-grow: 0;"
          :items="['OR', 'NOT']"
          :value="extras.operation"
          :error-messages="errors.extraTags && errors.extraTags[i]"
          @change="change(['extraTags', i, 'operation'], ...arguments)"
        />
        <smart-combobox
          label="Tags"
          :hint="extras.operation === 'OR' ? 'The effect will also target properties that have all of these tags instead' : 'The effect will ignore properties that have any of these tags'"
          class="mx-2"
          multiple
          chips
          deletable-chips
          persistent-hint
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
    <form-section
      name="Advanced"
      standalone
    >
      <smart-combobox
        label="Tags"
        multiple
        chips
        deletable-chips
        :value="model.tags"
        :error-messages="errors.tags"
        @change="change('tags', ...arguments)"
      />
      <v-expand-transition>
        <text-field
          v-if="model.targetByTags"
          label="Target field"
          :value="model.variableName"
          hint="Target a specific calculation field on the affected properties"
          :error-messages="errors.targetField"
          @change="change('targetField', ...arguments)"
        />
      </v-expand-transition>
    </form-section>
  </div>
</template>

<script lang="js">
	import getEffectIcon from '/imports/ui/utility/getEffectIcon.js';
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
  import attributeListMixin from '/imports/ui/properties/forms/shared/lists/attributeListMixin.js';
  import { EffectSchema } from '/imports/api/properties/Effects.js';
  import FormSection from '/imports/ui/properties/forms/shared/FormSection.vue';

	const ICON_SPIN_DURATION = 300;
	export default {
    components: {
			FormSection,
		},
    mixins: [propertyFormMixin, attributeListMixin],
		data(){ return {
			displayedIcon: 'add',
			iconClass: '',
      addExtraTagsLoading: false,
			operations: [
				{value: 'base', text: 'Base Value'},
				{value: 'add', text: 'Add'},
				{value: 'mul', text: 'Multiply'},
				{value: 'min', text: 'Minimum'},
        {value: 'max', text: 'Maximum'},
				{value: 'set', text: 'Set'},
				{value: 'advantage', text: 'Advantage'},
				{value: 'disadvantage', text: 'Disadvantage'},
				{value: 'passiveAdd', text: 'Passive Bonus'},
				{value: 'fail', text: 'Fail'},
				{value: 'conditional', text: 'Conditional Benefit'},
			],
		}},
		computed: {
      radioGroup(){
        return this.model.targetByTags ? 'tags' : 'stats';
      },
      extraTagsFull(){
        if (!this.model.extraTags) return false;
        let maxCount = EffectSchema.get('extraTags', 'maxCount');
        return this.model.extraTags.length >= maxCount;
      },
      needsValue(){
				switch(this.model.operation) {
					case 'base': return true;
					case 'add': return true;
					case 'mul': return true;
					case 'min': return true;
          case 'max': return true;
					case 'set': return true;
					case 'advantage': return false;
					case 'disadvantage': return false;
					case 'passiveAdd': return true;
					case 'fail': return false;
          case 'conditional': return false;
          default: return true;
				}
			},
      operationHint(){
				switch(this.model.operation) {
					case 'base': return 'Stats take their largest base value, and then apply all other effects';
					case 'add': return 'Add this vaulue to the stat';
					case 'mul': return 'Multiply the stat by this value';
					case 'min': return 'The stat will be at least this value';
          case 'max': return 'The stat will not exceed this value';
					case 'set': return 'The stat will be set to this value';
					case 'advantage': return 'If this stat is the basis for a check, that check will be at advantage';
					case 'disadvantage': return 'If this stat is the basis for a check, that check will be at advantage';
					case 'passiveAdd': return 'This value will be added to the passive check';
					case 'fail': return 'Targeted skills and checks will always fail';
          case 'conditional': return 'Add a text note to this stat';
          default: return '';
				}
			},
		},
		watch: {
			'model.operation': {
				immediate: true,
				handler(newValue, oldValue){
					let newIcon = getEffectIcon(newValue, 1);
					if (!oldValue){
						// Skip animation
						this.displayedIcon = newIcon;
					} else {
						this.iconClass='leaving';
						setTimeout(() => {
							this.displayedIcon = newIcon;
							this.iconClass='arriving';
							requestAnimationFrame(() => {
								this.iconClass='';
							});
						}, ICON_SPIN_DURATION / 2);
					}
				},
			},
		},
		methods: {
			getEffectIcon,
      changeTargetByTags(value){
        if(value === 'stats'){
          this.$emit('change', {path: ['targetByTags'], value: undefined});
        } else if (value === 'tags'){
          this.$emit('change', {path: ['targetByTags'], value: true});
        }
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
					ack: () => this.addExtraTagsLoading = false,
				});
			},
		}
	};
</script>

<style lang="css" scoped>
	.theme--light .icon {
		color: black;
	}
	.icon {
		min-width: 30px;
		transition: transform 0.15s linear, opacity 0.15s ease;
		transform-origin: 18px center;
		margin-left: -12px;
	}
	.icon.leaving {
		transform: translateY(-24px);
		opacity: 0;
	}
	.icon.arriving {
		transform: translateY(24px);
		opacity: 0;
		transition: none;
	}
	.hidden {
		visibility: hidden;
	}
	.effect-form > div {
		flex-basis: 220px;
	}
</style>
