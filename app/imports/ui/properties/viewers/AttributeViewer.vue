<template lang="html">
  <div class="attribute-viewer">
    <v-layout
      column
      align-center
    >
      <div
        v-if="model.value !== undefined"
        class="display-1"
      >
        <div
          v-if="model.damage !== undefined"
        >
          {{ model.value - model.damage }} / {{ model.value }}
        </div>
        <div v-else>
          {{ model.value }}
        </div>
      </div>
      <div
        v-if="model.modifier !== undefined"
        class="title"
      >
        {{ numberToSignedString(model.modifier) }}
      </div>
    </v-layout>
    <div>
      <property-name :value="model.name" />
      <property-variable-name :value="model.variableName" />
    </div>
    <property-field
      v-if="model.attributeType === 'hitDice' && model.hitDiceSize"
      name="Hit dice size"
      :value="model.hitDiceSize"
    />
    <property-field
      v-if="reset && model.attributeType !== 'hitDice'"
      name="Reset"
      :value="reset"
    />
    <property-description
      v-if="model.description"
      :value="model.description"
    />

    <effect-viewer
      v-if="context.creature && model.baseValueCalculation"
      :model="{
        name: 'Base value',
        result: model.baseValue,
        operation: 'base'
      }"
    />
    <effect-viewer
      v-for="effect in effects"
      :key="effect._id"
      :model="effect"
    />
  </div>
</template>

<script>
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
	import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
	import EffectViewer from '/imports/ui/properties/viewers/EffectViewer.vue';
  import CreatureProperties from '/imports/api/creature/CreatureProperties.js';

	export default {
    inject: {
      context: { default: {} }
    },
		components: {
			EffectViewer,
		},
		mixins: [propertyViewerMixin],
		computed: {
			reset(){
				let reset = this.model.reset
				if (reset === 'shortRest'){
					return 'Reset on a short rest';
				} else if (reset === 'longRest'){
					return 'Reset on a long rest';
				}
        return undefined;
			}
		},
		methods: {
			numberToSignedString,
		},
    meteor: {
      effects(){
        if (this.context.creature){
          let creatureId = this.context.creature._id;
          return CreatureProperties.find({
            'ancestors.id': creatureId,
            'stats': this.model.variableName,
            removed: {$ne: true},
          });
        } else {
          return [];
        }
      },
    },
	}
</script>

<style lang="css" scoped>
	.ability-value {
		font-weight: 600;
		font-size: 24px !important;
		color: rgba(0, 0, 0, 0.54);
	}
	.mod, .ability-value {
		text-align: center;
		width: 100%;
	}
	.attribute-value {
		text-align: center;
	}
</style>
