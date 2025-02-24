<template lang="html">
  <div class="folder-form">
    <inline-computation-field
      :label="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />
    <form-sections type="folder">
      <form-section :name="$t('FolderForm.R1pe28ZEPjbwlgpZzdOBx')">
        <smart-switch
          :label="$t('FolderForm.R84OXV09jmFO1f9TeS-KR')"
          :value="model.groupStats"
          :error-messages="errors.groupStats"
          @change="change('groupStats', ...arguments)"
        />
        <v-expand-transition>
          <div v-if="model.groupStats">
            <smart-switch
              :label="$t('FolderForm.F5tJESMNnFj72GGaYpdMc')"
              :value="model.hideStatsGroup"
              :error-messages="errors.hideStatsGroup"
              @change="change('hideStatsGroup', ...arguments)"
            />
            <smart-select
              clearable
              :label="$t('FolderForm.uSVTWqY1bgp6pHX8JaHVa')"
              :items="[
                { text: $t('FolderForm.hRK_ceriRti6rJTrakw6i'), value: 'stats' },
                { text: $t('FolderForm.O-kWcvLytlG27QDmjJkNM'), value: 'features' },
                { text: $t('FolderForm.AMEeuqc52F4zSdf1l7lzL'), value: 'actions' },
                { text: $t('FolderForm.p-iGQVvIZbSADeV-CLngl'), value: 'spells' },
                { text: $t('FolderForm.eoyw-vjLBTxDNpUe8BBil'), value: 'inventory' },
                { text: $t('FolderForm.XoCxPDCPQmESC8qqj1Pdm'), value: 'journal' },
                { text: $t('FolderForm.jIoUBd6RjQ_1yhAWRbcjc'), value: 'build' },
              ]"
              :value="model.tab"
              :error-messages="errors.tab"
              :menu-props="{auto: true, lazy: true}"
              @change="changeTab('tab', ...arguments)"
            />
            <smart-select
              clearable
              :label="$t('FolderForm.TSUGqutjpC2kAk2I1SoHY')"
              :items="locationItems"
              :value="model.location"
              :error-messages="errors.location"
              :menu-props="{auto: true, lazy: true}"
              @change="change('location', ...arguments)"
            />
          </div>
        </v-expand-transition>
      </form-section>
      <slot />
    </form-sections>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin';
import FormSection from '/imports/client/ui/properties/forms/shared/FormSection.vue';

export default {
  components: {
    FormSection,
  },
  mixins: [propertyFormMixin],
  computed: {
    locationItems() {
      if (this.model.tab === 'stats') {
        return [
          { text: this.$t('FolderForm.njKBgocRx-pKTqtt0mrOB'), value: 'start' },
          { text: this.$t('FolderForm.i-tGltjgjIXUurYmN2lKo'), value: 'events' },
          { text: this.$t('FolderForm.l-49G-c7LldbKdGd9foKr'), value: 'stats' },
          { text: this.$t('FolderForm.wkjm39H13dNoLVoGTvvZj'), value: 'skills' },
          { text: this.$t('FolderForm.biy1hZYci_6ZL7SKH7CcP'), value: 'proficiencies' },
          { text: this.$t('FolderForm.tGBQcx5WJYa9oLyr6Ek8N'), value: 'end' },
        ];
      } else {
        return [
          { text: this.$t('FolderForm.S0H0vocXzZVoRQQHx5siF'), value: 'start' },
          { text: this.$t('FolderForm.6pLWAMlfOogGtFQgY6953'), value: 'end' },
        ];
      }
    }
  },
  methods: {
    changeTab(path, value, ack) {
      if (!Array.isArray(path)){
        path = [path];
      }
      if (
        value !== 'stats' &&
        (this.model.location !== 'start' && this.model.location !== 'end')
        || (!this.model.location && value)
      )
      this.$emit('change', {path: ['location'], value: 'start'});
      this.$emit('change', {path, value, ack});
    },
  }
};
</script>

<style lang="css" scoped>

</style>
