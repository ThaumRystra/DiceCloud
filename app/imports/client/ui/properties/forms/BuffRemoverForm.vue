<template lang="html">
  <div class="buff-remover-form">
    <smart-toggle
      label="Target buffs"
      :value="model.targetParentBuff ? 'parent' : 'tag'"
      :options="[
        {name: 'Remove tagged buffs', value: 'tag'},
        {name: 'Remove parent buff', value: 'parent'},
      ]"
      @change="(value, ack) => change('targetParentBuff', value === 'parent' ? true : undefined, ack)"
    />
    <v-expand-transition>
      <div v-if="!model.targetParentBuff">
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
        <div class="mb-8" />
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <smart-toggle
              label="Remove matching buffs"
              :value="model.removeAll ? 'all' : 'one'"
              :options="[
                {name: 'Remove 1 buff', value: 'one'},
                {name: 'Remove all buffs', value: 'all'},
              ]"
              @change="(value, ack) => change('removeAll', value === 'all' ? true : undefined, ack)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <smart-toggle
              label="Target creature"
              :value="model.target"
              :options="[
                {name: 'Action Target', value: 'target'},
                {name: 'Self', value: 'self'},
              ]"
              :error-messages="errors.target"
              @change="change('target', ...arguments)"
            />
          </v-col>
        </v-row>
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
        name="Log"
      >
        <smart-switch
          label="Don't show in log"
          :value="model.silent"
          :error-messages="errors.silent"
          @change="change('silent', ...arguments)"
        />
      </form-section>
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';
import {
  BuffRemoverSchema
} from '/imports/api/properties/BuffRemovers.js';

export default {
  mixins: [propertyFormMixin],
  data(){return {
    addExtraTagsLoading: false,
    extraTagOperations: ['OR', 'NOT'],
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
