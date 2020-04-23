<template lang="html">
  <div class="results-form">
    <div class="subheading" v-if="model.damages.length">
      Damage
    </div>
    <damage-list-form
      :model="model.damages"
      :parent-target="parentTarget"
      @change="({path, value, ack}) => $emit('change', {path: ['damages', ...path], value, ack})"
      @push="({path, value, ack}) => $emit('push', {path: ['damages', ...path], value, ack})"
      @pull="({path, ack}) => $emit('pull', {path: ['damages', ...path], ack})"
    />
    <div class="subheading" v-if="model.adjustments.length">
      Adjustments
    </div>
    <adjustment-list-form
      :model="model.adjustments"
      :parent-target="parentTarget"
      @change="({path, value, ack}) => $emit('change', {path: ['adjustments', ...path], value, ack})"
      @push="({path, value, ack}) => $emit('push', {path: ['adjustments', ...path], value, ack})"
      @pull="({path, ack}) => $emit('pull', {path: ['adjustments', ...path], ack})"
    />
    <div class="subheading" v-if="model.buffs.length">
      Buffs
    </div>
    <buff-list-form
      :model="model.buffs"
      :parent-target="parentTarget"
      :stored="buffsStored"
      @change="({path, value, ack}) => $emit('change', {path: ['buffs', ...path], value, ack})"
      @push="({path, value, ack}) => $emit('push', {path: ['buffs', ...path], value, ack})"
      @pull="({path, ack}) => $emit('pull', {path: ['buffs', ...path], ack})"
    />
    <div class="layout row justify-center">
      <v-menu origin="center center" transition="scale-transition" nudge-top="50%" nudge-left="50%">
        <template v-slot:activator="{ on }">
          <v-btn
            :loading="addResultLoading"
            :disabled="addResultLoading"
            icon
            large
            outline
            v-on="on"
          >
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-tile@click="addDamage">
            <v-list-tile-title>Add Damage</v-list-tile-title>
          </v-list-tile>
          <v-list-tile@click="addAdjustment">
            <v-list-tile-title>Add Adjustment</v-list-tile-title>
          </v-list-tile>
          <v-list-tile@click="addBuff">
            <v-list-tile-title>Add Buff</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script>
  import AdjustmentListForm from '/imports/ui/properties/forms/AdjustmentListForm.vue';
  import DamageListForm from '/imports/ui/properties/forms/DamageListForm.vue';
  import BuffListForm from '/imports/ui/properties/forms/BuffListForm.vue';
  import ResultsSchema from '/imports/api/properties/subSchemas/ResultsSchema.js';
  import DamageSchema from '/imports/api/properties/subSchemas/DamageSchema.js';
	import AdjustmentSchema from '/imports/api/properties/subSchemas/AdjustmentSchema.js';
	import { StoredBuffWithIdSchema } from '/imports/api/properties/Buffs.js';

  export default {
    components: {
      AdjustmentListForm,
      DamageListForm,
      BuffListForm,
    },
    data(){return {
			addResultLoading: false,
		}},
    props: {
      model: {
        type: Object,
        default: () => (ResultsSchema.clean({})),
      },
      parentTarget: {
        type: String,
        default: undefined,
      },
      buffsStored: {
        type: Boolean,
      },
      debounceTime: {
        type: Number,
        default: undefined,
      },
    },
    methods: {
			acknowledgeAddResult(){
				this.addResultLoading = false;
			},
      addDamage(){
				this.addResultLoading = true;
				this.$emit('push', {
					path: ['damages'],
					value: DamageSchema.clean({}),
					ack: this.acknowledgeAddResult,
				});
			},
			addAdjustment(){
				this.addResultLoading = true;
				this.$emit('push', {
					path: ['adjustments'],
					value: AdjustmentSchema.clean({}),
					ack: this.acknowledgeAddResult,
				});
			},
      addBuff(){
				this.addResultLoading = true;
				this.$emit('push', {
          path: ['buffs'],
          value: StoredBuffWithIdSchema.clean({}),
          ack: this.acknowledgeAddResult
        });
			},
		},
  }
</script>

<style lang="css" scoped>
</style>
