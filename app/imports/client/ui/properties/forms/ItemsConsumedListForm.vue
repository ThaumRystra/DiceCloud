<template lang="html">
  <div class="mt-4">
    <v-slide-x-transition group>
      <div
        v-for="(item, i) in model"
        :key="item._id || i"
      >
        <div class="layout align-center">
          <div style="flex-grow: 1;">
            <item-consumed-form
              :model="item"
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
import ItemConsumedForm from '/imports/client/ui/properties/forms/ItemConsumedForm.vue';
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';

export default {
  components: {
    ItemConsumedForm,
  },
  mixins: [propertyFormMixin],
}
</script>
