<template lang="html">
  <div class="results-form">
    <div
      v-if="model.damages.length"
      class="subheading"
    >
      Damage
    </div>
    <damage-list-form
      :model="model.damages"
      :parent-target="parentTarget"
      @change="({path, value, ack}) => $emit('change', {path: ['damages', ...path], value, ack})"
      @push="({path, value, ack}) => $emit('push', {path: ['damages', ...path], value, ack})"
      @pull="({path, ack}) => $emit('pull', {path: ['damages', ...path], ack})"
    />
    <div
      v-if="model.adjustments.length"
      class="subheading"
    >
      Adjustments
    </div>
    <adjustment-list-form
      :model="model.adjustments"
      :parent-target="parentTarget"
      @change="({path, value, ack}) => $emit('change', {path: ['adjustments', ...path], value, ack})"
      @push="({path, value, ack}) => $emit('push', {path: ['adjustments', ...path], value, ack})"
      @pull="({path, ack}) => $emit('pull', {path: ['adjustments', ...path], ack})"
    />
    <div
      v-if="model.buffs.length"
      class="subheading"
    >
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
      <v-menu
        origin="center center"
        transition="scale-transition"
        nudge-top="50%"
        nudge-left="50%"
      >
        <template #activator="{ on }">
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
              </v-list-tile@click="addbuff">
            </v-list-tile@click="addadjustment">
          </v-list-tile@click="adddamage">
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script>
  import AdjustmentListForm from '/imports/ui/properties/forms/AdjustmentListForm.vue';
  import DamageListForm from '/imports/ui/properties/forms/DamageListForm.vue';
  import BuffListForm from '/imports/ui/properties/forms/BuffListForm.vue';
	import { StoredBuffWithIdSchema } from '/imports/api/properties/Buffs.js';

  export default {
    components: {
      AdjustmentListForm,
      DamageListForm,
      BuffListForm,
    },
    props: {
      model: {
        type: Object,
        default: () => ({}),
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
    data(){return {
			addResultLoading: false,
		}},
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
