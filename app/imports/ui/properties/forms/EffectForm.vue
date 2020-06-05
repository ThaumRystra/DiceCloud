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
      append-icon="arrow_drop_down"
      class="mx-2"
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
      :value="model.stats"
      :items="attributeList"
      :error-messages="errors.stats"
      @change="change('stats', ...arguments)"
    />
    <text-field
      label="Value"
      class="mr-2"
      :persistent-hint="needsValue"
      :value="needsValue ? (model.calculation) : ' '"
      :disabled="!needsValue"
      :error-messages="errors.calculation"
      :hint="!isFinite(model.calculation) && model.result ? model.result + '' : '' "
      @change="change('calculation', ...arguments)"
    />
    <calculation-error-list :errors="model.errors" />
  </div>
</template>

<script>
	import getEffectIcon from '/imports/ui/utility/getEffectIcon.js';
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';
  import attributeListMixin from '/imports/ui/properties/forms/shared/lists/attributeListMixin.js';
  import CalculationErrorList from '/imports/ui/properties/forms/shared/CalculationErrorList.vue';

	const ICON_SPIN_DURATION = 300;
	export default {
    components: {
      CalculationErrorList,
    },
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
					case 'rollBonus': return true;
          default: return true;
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
