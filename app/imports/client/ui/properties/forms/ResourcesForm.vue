<template lang="html">
  <div class="resources-form">
    <div
      v-if="model.conditions && model.conditions.length"
      class="subheading"
    >
      Conditions
    </div>
    <action-conditions-list-form
      :model="model.conditions"
      @change="({path, value, ack}) => $emit('change', {path: ['conditions', ...path], value, ack})"
      @push="({path, value, ack}) => $emit('push', {path: ['conditions', ...path], value, ack})"
      @pull="({path, ack}) => $emit('pull', {path: ['conditions', ...path], ack})"
    />
    <div
      v-if="model.attributesConsumed && model.attributesConsumed.length"
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
    <div
      v-if="model.itemsConsumed && model.itemsConsumed.length"
      class="subheading"
    >
      Ammo
    </div>
    <items-consumed-list-form
      :model="model.itemsConsumed"
      @change="({path, value, ack}) => $emit('change', {path: ['itemsConsumed', ...path], value, ack})"
      @push="({path, value, ack}) => $emit('push', {path: ['itemsConsumed', ...path], value, ack})"
      @pull="({path, ack}) => $emit('pull', {path: ['itemsConsumed', ...path], ack})"
    />
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
          outlined
          color="accent"
          v-on="on"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="addCondition">
          <v-list-item-title>Add Condition</v-list-item-title>
        </v-list-item>
        <v-list-item @click="addAttributesConsumed">
          <v-list-item-title>Add Resource</v-list-item-title>
        </v-list-item>
        <v-list-item @click="addItemsConsumed">
          <v-list-item-title>Add Ammo</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="js">
import AttributesConsumedListForm from '/imports/client/ui/properties/forms/AttributesConsumedListForm.vue';
import ActionConditionsListForm from '/imports/client/ui/properties/forms/ActionConditionsListForm.vue';
import ItemsConsumedListForm from '/imports/client/ui/properties/forms/ItemsConsumedListForm.vue';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  components: {
    ActionConditionsListForm,
    AttributesConsumedListForm,
    ItemsConsumedListForm,
  },
  mixins: [propertyFormMixin],
  inject: {
    context: { default: {} }
  },
  props: {
    parentTarget: {
      type: String,
      default: undefined,
    },
    buffsStored: {
      type: Boolean,
    },
  },
  data() {
    return {
      addResourceLoading: false,
    }
  },
  methods: {
    acknowledgeAddResult() {
      this.addResourceLoading = false;
    },
    addAttributesConsumed() {
      this.addResourceLoading = true;
      this.$emit('push', {
        path: ['attributesConsumed'],
        value: { _id: Random.id() },
        ack: this.acknowledgeAddResult,
      });
    },
    addItemsConsumed() {
      this.addResourceLoading = true;
      this.$emit('push', {
        path: ['itemsConsumed'],
        value: { _id: Random.id() },
        ack: this.acknowledgeAddResult,
      });
    },
    addCondition() {
      this.addResourceLoading = true;
      this.$emit('push', {
        path: ['conditions'],
        value: { _id: Random.id() },
        ack: this.acknowledgeAddResult,
      });
    },
  },
}
</script>

<style lang="css" scoped>

</style>
