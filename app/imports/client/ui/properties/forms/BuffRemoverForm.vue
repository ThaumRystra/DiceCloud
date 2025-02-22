<template lang="html">
  <div class="buff-remover-form">
    <smart-toggle
      :label="$t('BuffRemoverForm.koccxDVJa0JKkspKWF73T')"
      :value="model.targetParentBuff ? 'parent' : 'tag'"
      :options="[
        {name: $t('BuffRemoverForm.OYEP_6V-THVmJ4RRy2p7P'), value: 'tag'},
        {name: $t('BuffRemoverForm.1Zvsru6SwSLDga99voeii'), value: 'parent'},
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
              :label="$t('BuffRemoverForm.IlQFf_rfodgD6E17Y8B4w')"
              :value="model.removeAll ? 'all' : 'one'"
              :options="[
                {name: $t('BuffRemoverForm.X5fuj3rRPFrdLgikpzdha'), value: 'one'},
                {name: $t('BuffRemoverForm.597m5h8jhIy_9rID_47Yj'), value: 'all'},
              ]"
              @change="(value, ack) => change('removeAll', value === 'all' ? true : undefined, ack)"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <smart-toggle
              :label="$t('ActionForm.IwoGz7GsJv8SJpY4hizQ8')"
              :value="model.target"
              :options="[
                {name: $t('BuffRemoverForm.wP1izzQbSh60_E36Jwhdv'), value: 'target'},
                {name: $t('ActionForm.wvr48hnF1DbxApmRDC3R0'), value: 'self'},
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
        :name="$t('BuffRemoverForm.mfgWVnzACJzVST8OLqhdo')"
        standalone
      >
        <slot name="children" />
      </form-section>
      <form-section
        :name="$t('ActionForm.7JkrChA5Oz7n_-wF0QxsW')"
      >
        <smart-switch
          :label="$t('ActionForm.pTOkAuMdrx_hGI0E1xQl2')"
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
