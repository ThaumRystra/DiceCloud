<template lang="html">
  <div class="resources-form">
    <div
      v-if="model.attributesConsumed.length"
      class="subheading"
    >
      Attributes
    </div>
    <attributes-consumed-list-form
      :model="model.attributesConsumed"
      @change="({path, value, ack}) => $emit('change', {path: ['attributesConsumed', ...path], value, ack})"
      @push="({path, value, ack}) => $emit('push', {path: ['attributesConsumed', ...path], value, ack})"
      @pull="({path, ack}) => $emit('pull', {path: ['attributesConsumed', ...path], ack})"
    />
    <items-consumed-list-form
      :model="model.itemsConsumed"
      @change="({path, value, ack}) => $emit('change', {path: ['itemsConsumed', ...path], value, ack})"
      @push="({path, value, ack}) => $emit('push', {path: ['itemsConsumed', ...path], value, ack})"
      @pull="({path, ack}) => $emit('pull', {path: ['itemsConsumed', ...path], ack})"
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
            :loading="addResourceLoading"
            :disabled="addResourceLoading || context.editPermission === false"
            icon
            large
            outline
            v-on="on"
          >
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-tile @click="addAttributesConsumed">
            <v-list-tile-title>Add Resource</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="addItemsConsumed">
            <v-list-tile-title>Add Ammo</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script>
  import AttributesConsumedListForm from '/imports/ui/properties/forms/AttributesConsumedListForm.vue';
  import ItemsConsumedListForm from '/imports/ui/properties/forms/ItemsConsumedListForm.vue';
  import ItemConsumedSchema from '/imports/api/properties/subSchemas/ItemConsumedSchema.js';
  import AttributeConsumedSchema from '/imports/api/properties/subSchemas/AttributeConsumedSchema.js';
  import propertyFormMixin from '/imports/ui/properties/forms/shared/propertyFormMixin.js';

  export default {
    components: {
      AttributesConsumedListForm,
      ItemsConsumedListForm,
    },
    inject: {
      context: { default: {} }
    },
    mixins: [propertyFormMixin],
    props: {
      parentTarget: {
        type: String,
        default: undefined,
      },
      buffsStored: {
        type: Boolean,
      },
    },
    data(){return {
			addResourceLoading: false,
		}},
    methods: {
			acknowledgeAddResult(){
				this.addResourceLoading = false;
			},
      addAttributesConsumed(){
				this.addResourceLoading = true;
				this.$emit('push', {
					path: ['attributesConsumed'],
          value: AttributeConsumedSchema.clean({}),
					ack: this.acknowledgeAddResult,
				});
			},
			addItemsConsumed(){
				this.addResourceLoading = true;
				this.$emit('push', {
					path: ['itemsConsumed'],
          value: ItemConsumedSchema.clean({}),
					ack: this.acknowledgeAddResult,
				});
			},
		},
  }
</script>

<style lang="css" scoped>
</style>
