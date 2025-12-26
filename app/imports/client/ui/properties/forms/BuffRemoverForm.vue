<template lang="html">
  <div class="buff-remover-form">
    <smart-toggle
      :label="$t('properties.forms.buffRemoverForm.targetBuffs')"
      :value="model.targetParentBuff ? 'parent' : 'tag'"
      :options="[
        {name: $t('properties.forms.buffRemoverForm.removeTaggedBuffs'), value: 'tag'},
        {name: $t('properties.forms.buffRemoverForm.removeParentBuff'), value: 'parent'},
      ]"
      @change="(value, ack) => change('targetParentBuff', value === 'parent' ? true : undefined, ack)"
    />
    <v-expand-transition>
      <div v-if="!model.targetParentBuff">
        <tag-targeting
          :model="model"
          :errors="errors"
          @change="e => $emit('change', e)"
          @push="e => $emit('push', e)"
          @pull="e => $emit('pull', e)"
        />
        <div class="mb-6" />
        <v-row dense>
          <v-col
            cols="12"
            md="6"
          >
            <smart-toggle
              :label="$t('properties.forms.buffRemoverForm.removeMatchingBuffs')"
              :value="model.removeAll ? 'all' : 'one'"
              :options="[
                {name: $t('properties.forms.buffRemoverForm.remove1Buff'), value: 'one'},
                {name: $t('properties.forms.buffRemoverForm.removeAllBuffs'), value: 'all'},
              ]"
              @change="(value, ack) => change('removeAll', value === 'all' ? true : undefined, ack)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <smart-toggle
              :label="$t('properties.forms.savingThrowForm.targetCreature')"
              :value="model.target"
              :options="[
                {name: $t('properties.forms.savingThrowForm.actionTarget'), value: 'target'},
                {name: $t('properties.forms.savingThrowForm.self'), value: 'self'},
              ]"
              :error-messages="errors.target"
              @change="change('target', ...arguments)"
            />
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
    <form-sections type="buffRemover">
      <form-section
        v-if="$slots.children"
        :name="$t('properties.forms.damageMultiplierForm.children')"
        standalone
      >
        <slot name="children" />
      </form-section>
      <form-section
        :name="$t('properties.forms.common.log')"
      >
        <smart-switch
          :label="$t('properties.forms.actionForm.dontShowInLog')"
          :value="model.silent"
          :error-messages="errors.silent"
          @change="change('silent', ...arguments)"
        />
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import TagTargeting from '/imports/client/ui/properties/forms/shared/TagTargeting.vue';

import {
  BuffRemoverSchema
} from '/imports/api/properties/BuffRemovers';

export default {
  components: {
    TagTargeting,
  },
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
