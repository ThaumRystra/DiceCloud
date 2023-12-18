<template lang="html">
  <div class="mt-4">
    <v-slide-x-transition group>
      <div
        v-for="(attribute, i) in model"
        :key="attribute._id || i"
      >
        <div class="layout align-center">
          <div style="flex-grow: 1;">
            <attribute-consumed-form
              :model="attribute"
              @change="({path, value, ack}) => change([i, ...path], value, ack)"
            />
          </div>
          <v-btn
            outlined
            icon
            large
            class="ma-3"
            style="margin-bottom: 30px !important;"
            @click="$emit('pull', {path: [i]})"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </div>
    </v-slide-x-transition>
  </div>
</template>

<script lang="js">
import AttributeConsumedForm from '/imports/client/ui/properties/forms/AttributeConsumedForm.vue';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  components: {
    AttributeConsumedForm,
  },
  mixins: [propertyFormMixin],
}
</script>
