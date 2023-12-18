<template lang="html">
  <div class="folder-form">
    <inline-computation-field
      label="Description"
      :model="model.description"
      :error-messages="errors['description.text']"
      @change="({path, value, ack}) =>
        $emit('change', {path: ['description', ...path], value, ack})"
    />
    <form-sections type="folder">
      <form-section name="Grouping">
        <smart-switch
          label="Group children on a card"
          :value="model.groupStats"
          :error-messages="errors.groupStats"
          @change="change('groupStats', ...arguments)"
        />
        <v-expand-transition>
          <div v-if="model.groupStats">
            <smart-switch
              label="Hide children from their default locations"
              :value="model.hideStatsGroup"
              :error-messages="errors.hideStatsGroup"
              @change="change('hideStatsGroup', ...arguments)"
            />
            <smart-select
              clearable
              label="Tab"
              :items="[
                { text: 'Stats Tab', value: 'stats' },
                { text: 'Features Tab', value: 'features' },
                { text: 'Actions Tab', value: 'actions' },
                { text: 'Spells Tab', value: 'spells' },
                { text: 'Inventory Tab', value: 'inventory' },
                { text: 'Journal Tab', value: 'journal' },
                { text: 'Build Tab', value: 'build' },
              ]"
              :value="model.tab"
              :error-messages="errors.tab"
              :menu-props="{auto: true, lazy: true}"
              @change="changeTab('tab', ...arguments)"
            />
            <smart-select
              clearable
              label="Location"
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
          { text: 'Start', value: 'start' },
          { text: 'After events', value: 'events' },
          { text: 'After stats', value: 'stats' },
          { text: 'After skills', value: 'skills' },
          { text: 'After proficiencies', value: 'proficiencies' },
          { text: 'End', value: 'end' },
        ];
      } else {
        return [
          { text: 'Start', value: 'start' },
          { text: 'End', value: 'end' },
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
