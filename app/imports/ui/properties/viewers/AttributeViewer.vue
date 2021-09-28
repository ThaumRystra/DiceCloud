<template lang="html">
  <div class="attribute-viewer">
    <v-layout
      column
      align-center
    >
      <v-layout v-if="model.value !== undefined">
        <div
          class="text-h4 mr-3"
        >
          <div
            v-if="model.damage !== undefined"
          >
            {{ model.value }} / {{ model.total }}
          </div>
          <div v-else>
            {{ model.value }}
          </div>
        </div>

        <increment-button
          v-if="context.creatureId"
          icon
          large
          outlined
          color="primary"
          :value="model.value"
          @change="damageProperty"
        >
          <v-icon>$vuetify.icons.abacus</v-icon>
        </increment-button>
      </v-layout>
      <div
        v-if="model.modifier !== undefined"
        class="text-h6"
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
      :model="model.description"
    />
    <v-list>
      <attribute-effect
        v-for="effect in baseEffects"
        :key="effect._id"
        :model="effect"
        :hide-breadcrumbs="effect._id === model._id"
        :data-id="effect._id"
        @click="effect._id !== model._id && clickEffect(effect._id)"
      />
      <attribute-effect
        v-for="effect in effects"
        :key="effect._id"
        :model="effect"
        :data-id="effect._id"
        @click="clickEffect(effect._id)"
      />
    </v-list>
  </div>
</template>

<script lang="js">
	import propertyViewerMixin from '/imports/ui/properties/viewers/shared/propertyViewerMixin.js'
	import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
	import AttributeEffect from '/imports/ui/properties/components/attributes/AttributeEffect.vue';
  import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
  import damageProperty from '/imports/api/creature/creatureProperties/methods/damageProperty.js';
  import IncrementButton from '/imports/ui/components/IncrementButton.vue';

	export default {
		components: {
			AttributeEffect,
      IncrementButton,
		},
		mixins: [propertyViewerMixin],
    inject: {
      context: { default: {} }
    },
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
      clickEffect(id){
        this.$store.commit('pushDialogStack', {
          component: 'creature-property-dialog',
          elementId: `${id}`,
          data: {_id: id},
        });
      },
      damageProperty({type, value}) {
        damageProperty.call({
          _id: this.model._id,
          operation: type,
          value: value
        });
      },
		},
    meteor: {
      baseEffects(){
        if (this.context.creatureId){
          let creatureId = this.context.creatureId;
          return CreatureProperties.find({
            'ancestors.id': creatureId,
            type: 'attribute',
            variableName: this.model.variableName,
            removed: {$ne: true},
            inactive: {$ne: true},
          }).map( prop => ({
            _id: prop._id,
            name: 'Attribute base value',
            operation: 'base',
            amount: prop.baseValue,
            stats: [prop.variableName],
            ancestors: prop.ancestors,
          }) ).filter(effect => effect.amount);
        } else {
          return [];
        }
      },
      effects(){
        if (this.context.creatureId){
          let creatureId = this.context.creatureId;
          return CreatureProperties.find({
            'ancestors.id': creatureId,
            'stats': this.model.variableName,
            removed: {$ne: true},
            inactive: {$ne: true},
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
