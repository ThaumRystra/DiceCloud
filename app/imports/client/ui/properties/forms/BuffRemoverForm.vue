<template>
  <div class="buff-remover-form">
    <text-field
      ref="focusFirst"
      label="Name"
      :value="model.name"
      :error-messages="errors.name"
      @change="change('name', ...arguments)"
    />
    <smart-switch
      label="Remove parent buff"
      :value="model.targetParentBuff"
      :error-messages="errors.targetParentBuff"
      @change="change('targetParentBuff', ...arguments)"
    />
    <v-expand-transition>
      <div v-if="!model.targetParentBuff">
        <smart-switch
          :label="model.removeAll ? 'Remove All. All matching buffs will be removed' : 'Remove All. Only 1 matching buff will be removed'"
          :value="model.removeAll"
          :error-messages="errors.removeAll"
          @change="change('removeAll', ...arguments)"
        />
        <smart-select
          label="Target"
          :items="targetOptions"
          :value="model.target"
          :error-messages="errors.target"
          :menu-props="{auto: true, lazy: true}"
          @change="change('target', ...arguments)"
        />
        <v-layout
          align-center
        >
          <v-btn
            icon
            style="margin-top: -30px;"
            class="mr-2"
            :loading="addExtraTagsLoading"
            :disabled="extraTagsFull"
            @click="addExtraTags"
          >
            <v-icon>
              mdi-plus
            </v-icon>
          </v-btn>
          <smart-combobox
            label="Tags Required"
            hint="The effect will apply to properties that have all the listed tags"
            multiple
            chips
            deletable-chips
            persistent-hint
            :value="model.targetTags"
            :error-messages="errors.targetTags"
            @change="change('targetTags', ...arguments)"
          />
        </v-layout>
        <v-slide-x-transition
          v-if="!model.targetParentBuff"
          group
        >
          <div
            v-for="(extras, i) in model.extraTags"
            :key="extras._id"
            class="target-tags layout align-center justify-space-between"
          >
            <smart-select
              label="Operation"
              style="width: 90px; flex-grow: 0;"
              :items="['OR', 'NOT']"
              :value="extras.operation"
              :error-messages="errors.extraTags && errors.extraTags[i]"
              @change="change(['extraTags', i, 'operation'], ...arguments)"
            />
            <smart-combobox
              label="Tags"
              :hint="extras.operation === 'OR' ? 'The effect will also target properties that have all of these tags instead' : 'The effect will ignore properties that have any of these tags'"
              class="mx-2"
              multiple
              chips
              deletable-chips
              persistent-hint
              :value="extras.tags"
              @change="change(['extraTags', i, 'tags'], ...arguments)"
            />
            <v-btn
              icon
              style="margin-top: -30px;"
              @click="$emit('pull', {path: ['extraTags', i]})"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </v-slide-x-transition>
      </div>
    </v-expand-transition>
    <form-sections>
      <form-section
        v-if="$slots.children"
        name="Children"
        standalone
      >
        <slot name="children" />
      </form-section>
      <form-section
        name="Advanced"
      >
        <smart-combobox
          label="Tags"
          multiple
          chips
          deletable-chips
          hint="Used to let slots find this property in a library, should otherwise be left blank"
          :value="model.tags"
          @change="change('tags', ...arguments)"
        />
        <v-row dense>
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <smart-switch
              label="Don't show in log"
              :value="model.silent"
              :error-messages="errors.silent"
              @change="change('silent', ...arguments)"
            />
          </v-col>
        </v-row>
      </form-section>
    </form-sections>
  </div>
</template>

<script>
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';
import {
  BuffRemoverSchema
} from '/imports/api/properties/BuffRemovers.js';

export default {
  mixins: [propertyFormMixin],
  data(){return {
    addExtraTagsLoading: false,
    extraTagOperations: ['OR', 'NOT'],
    targetOptions: [
      {
        text: 'Self',
        value: 'self',
      }, {
        text: 'Target',
        value: 'target',
      },
    ],
  }},
  computed: {
    extraTagsFull(){
      if (!this.model.extraTags) return false;
      let maxCount = BuffRemoverSchema.get('extraTags', 'maxCount');
      return this.model.extraTags.length >= maxCount;
    },
  },
  methods: {
    acknowledgeAddResult(){
      this.addExtraTagsLoading = false;
    },
    addExtraTags(){
      this.addExtraTagsLoading = true;
      this.$emit('push', {
        path: ['extraTags'],
        value: {
          _id: Random.id(),
          operation: 'OR',
          tags: [],
        },
        ack: this.acknowledgeAddResult,
      });
    },
  },
}
</script>

<style lang="css" scoped>
</style>
