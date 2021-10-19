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
      class="mx-2"
      :hint="operationHint"
      :error-messages="errors.operation"
      :menu-props="{transition: 'slide-y-transition', lazy: true}"
      :items="operations"
      :value="model.operation"
      @change="change('operation', ...arguments)"
    >
      <v-icon
        slot="prepend"
        class="icon"
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
    <smart-combobox
      label="Stats"
      class="mr-2"
      multiple
      chips
      deletable-chips
      hint="Which stats will this effect apply to"
      :value="model.stats"
      :items="attributeList"
      :error-messages="errors.stats"
      @change="change('stats', ...arguments)"
    />
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
      class="mr-2"
      hint="Number or calculation to determine the value of this effect"
      :persistent-hint="needsValue"
      :disabled="!needsValue"
      :model="model.amount"
      :error-messages="errors.amount"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['amount', ...path], value, ack})"
    />
    <smart-combobox
      label="Tags"
      multiple
      chips
      deletable-chips
      :value="model.tags"
      :error-messages="errors.tags"
      @change="change('tags', ...arguments)"
    />
  </div>
</template>

<script lang="js">
	import getEffectIcon from '/imports/ui/utility/getEffectIcon.js';
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
  import attributeListMixin from '/imports/ui/properties/forms/shared/lists/attributeListMixin.js';

	const ICON_SPIN_DURATION = 300;
	export default {
    mixins: [propertyFormMixin, attributeListMixin],
		data(){ return {
			displayedIcon: 'add',
			iconClass: '',
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
