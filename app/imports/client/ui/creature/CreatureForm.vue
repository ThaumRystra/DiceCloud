<template lang="html">
  <div class="creature-form">
    <text-field
      label="Name"
      :disabled="!editPermission"
      :value="model.name"
      :error-messages="errors.name"
      @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
    />
    <text-field
      label="Alignment"
      :disabled="!editPermission"
      :value="model.alignment"
      :error-messages="errors.alignment"
      @change="(value, ack) => $emit('change', {path: ['alignment'], value, ack})"
    />
    <text-field
      label="Gender"
      :disabled="!editPermission"
      :value="model.gender"
      :error-messages="errors.gender"
      @change="(value, ack) => $emit('change', {path: ['gender'], value, ack})"
    />
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <smart-image-input
          label="Picture"
          hint="A link to a high resolution image"
          :disabled="!editPermission"
          :value="model.picture"
          :error-messages="errors.picture"
          @change="(value, ack) => $emit('change', {path: ['picture'], value, ack})"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-image-input
          label="Avatar"
          hint="A link to a smaller, square image to use as an avatar"
          :disabled="!editPermission"
          :value="model.avatarPicture"
          :error-messages="errors.avatarPicture"
          @change="(value, ack) => $emit('change', {path: ['avatarPicture'], value, ack})"
        />
      </v-col>
    </v-row>
    <form-sections>
      <form-section name="Settings">
        <v-switch
          label="Hide redundant stats"
          :disabled="!editPermission"
          :input-value="model.settings.hideUnusedStats"
          @change="value => $emit('change', {path: ['settings','hideUnusedStats'], value: !!value})"
        />
        <v-switch
          label="Hide rest buttons"
          :disabled="!editPermission"
          :input-value="model.settings.hideRestButtons"
          @change="value => $emit('change', {path: ['settings','hideRestButtons'], value: !!value})"
        />
        <v-switch
          label="Show spells tab"
          :disabled="!editPermission"
          :input-value="!model.settings.hideSpellsTab"
          @change="changeHideSpellsTab"
        />
        <v-switch
          label="Show tree tab"
          :disabled="!editPermission"
          :input-value="model.settings.showTreeTab"
          @change="changeShowTreeTab"
        />
        <text-field
          label="Hit Dice reset multiplier"
          hint="What fraction of your hit dice are reset every long rest"
          placeholder="0.5"
          type="number"
          min="0"
          max="1"
          step="0.1"
          :disabled="!editPermission"
          :value="model.settings.hitDiceResetMultiplier"
          @change="(value, ack) => $emit('change', {path: ['settings','hitDiceResetMultiplier'], value, ack})"
        />
        <text-field
          label="Discord Webhook URL"
          hint="This creature's logs will be posted to the discord channel"
          placeholder="https://discordapp.com/api/webhooks/<id>/<token>"
          :disabled="!editPermission"
          :value="model.settings.discordWebhook"
          @change="(value, ack) => $emit('change', {path: ['settings','discordWebhook'], value, ack})"
        />
        <!--
        <v-switch
          label="Use variant encumbrance"
          :input-value="model.settings.useVariantEncumbrance"
          :error-messages="errors.useVariantEncumbrance"
          @change="value => $emit('change', {path: ['settings','useVariantEncumbrance'], value})"
        />
        <v-switch
          label="Hide spells tab"
          :input-value="model.settings.hideSpellcasting"
          :error-messages="errors.hideSpellcasting"
          @change="value => $emit('change', {path: ['settings','hideSpellcasting'], value})"
        />
        <v-switch
          label="Swap ability scores and modifiers"
          :input-value="model.settings.swapStatAndModifier"
          :error-messages="errors.swapStatAndModifier"
          @change="value => $emit('change', {path: ['settings','swapStatAndModifier'], value})"
        />
        -->
      </form-section>
      <form-section name="Libraries">
        <smart-switch
          label="All user libraries"
          :disabled="!editPermission"
          :value="allUserLibraries"
          @change="allUserLibrariesChange"
        />
        <library-list
          selection
          :disabled="!editPermission || (!model.allowedLibraries && !model.allowedLibraryCollections)"
          :libraries-selected="model.allowedLibraries"
          :library-collections-selected="model.allowedLibraryCollections"
          :libraries-selected-by-collections="librariesSelectedByCollections"
          @select-library="selectLibrary"
          @select-library-collection="selectLibraryCollection"
        />
        <v-progress-linear
          v-if="libraryWriteLoading"
          style="margin: 12px -24px -16px -24px; width: calc(100% + 48px);"
          indeterminate
        />
        <p
          v-if="libraryWriteError"
          class="text--error"
        >
          {{ libraryWriteError }}
        </p>
      </form-section>
      <form-section name="Debug">
        <v-btn
          data-id="dependency-graph-button"
          text
          @click="showDependencyGraph"
        >
          <v-icon left>
            mdi-graph
          </v-icon>
          Dependency Graph
        </v-btn>
      </form-section>
    </form-sections>
  </div>
</template>

<script lang="js">
import { union, without, debounce } from 'lodash';
import FormSection, { FormSections } from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import LibraryList from '/imports/client/ui/library/LibraryList.vue';
import LibraryCollections from '/imports/api/library/LibraryCollections';
import { changeAllowedLibraries, toggleAllUserLibraries } from '/imports/api/creature/creatures/methods/changeAllowedLibraries';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import SmartImageInput from '/imports/client/ui/components/global/SmartImageInput.vue';

export default {
  components: {
    FormSection,
    FormSections,
    LibraryList,
    SmartImageInput,
  },
  props: {
    stored: {
      type: Boolean,
    },
    model: {
      type: Object,
      default: () => ({}),
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
    attackForm: {
      type: Boolean,
    },
    disabled: Boolean,
  },
  data() {
    return {
      libraryCollections: this.model.allowedLibraryCollections,
      libraries: this.model.allowedLibraries,
      libraryWriteLoading: false,
      libraryWriteError: undefined,
      dirty: false, // If there are pending changes
    }
  },
  computed: {
    allUserLibraries() {
      return !this.model.allowedLibraries && !this.model.allowedLibraryCollections
    },
  },
  watch: {
    'model.allowedLibraryCollections': function (newVal) {
      if (!this.dirty) this.libraryCollections = newVal;
    },
    'model.allowedLibraries': function (newVal) {
      if (!this.dirty) this.libraries = newVal;
    },
  },
  mounted() {
    this.updateAllowedLibraryCollections = debounce(() => {
      this.libraryWriteLoading = true;
      this.dirty = false;
      changeAllowedLibraries.call({
        _id: this.model._id,
        allowedLibraryCollections: this.libraryCollections,
      }, error => {
        this.libraryWriteLoading = false;
        this.libraryWriteError = error;
      });
    }, 500);

    this.updateAllowedLibraries = debounce(() => {
      this.libraryWriteLoading = true;
      this.dirty = false;
      changeAllowedLibraries.call({
        _id: this.model._id,
        allowedLibraries: this.libraries,
      }, error => {
        this.libraryWriteLoading = false;
        this.libraryWriteError = error;
      });
    }, 500);
  },
  meteor: {
    $subscribe: {
      'libraries': [],
    },
    librariesSelectedByCollections() {
      let ids = [];
      if (!this.model.allowedLibraryCollections) return ids;
      LibraryCollections.find({
        _id: { $in: this.model.allowedLibraryCollections }
      }).forEach(collection => {
        ids = union(ids, collection.libraries);
      });
      return ids;
    },
    editPermission() {
      try {
        assertEditPermission(this.model, Meteor.userId());
        return true;
      } catch (e) {
        return false;
      }
    },
  },
  methods: {
    changeShowTreeTab(value) {
      let currentTab = this.$store.getters.tabNameById(this.model._id);
      if (!value && currentTab === 'tree') {
        this.$store.commit(
          'setTabForCharacterSheet',
          { id: this.model._id, tab: 'build' }
        );
      }
      this.$emit('change', {
        path: ['settings', 'showTreeTab'],
        value: !!value
      });
    },
    changeHideSpellsTab(value) {
      let currentTab = this.$store.getters.tabNameById(this.model._id);
      if (!value && currentTab === 'spells') {
        this.$store.commit(
          'setTabForCharacterSheet',
          { id: this.model._id, tab: 'actions' }
        );
      }
      this.$emit('change', {
        path: ['settings', 'hideSpellsTab'],
        value: !value
      });
    },
    allUserLibrariesChange(value, ack) {
      toggleAllUserLibraries.call({
        _id: this.model._id,
        value,
      }, error => ack(error));
    },
    selectLibrary(id, val) {
      if (val) {
        this.libraries = union(this.libraries, [id]);
      } else {
        this.libraries = without(this.libraries, id);
      }
      this.dirty = true;
      this.updateAllowedLibraries();
    },
    selectLibraryCollection(id, val) {
      if (val) {
        this.libraryCollections = union(this.libraryCollections, [id]);
      } else {
        this.libraryCollections = without(this.libraryCollections, id);
      }
      this.dirty = true;
      this.updateAllowedLibraryCollections();
    },
    showDependencyGraph() {
      this.$store.commit('pushDialogStack', {
        component: 'dependency-graph-dialog',
        elementId: 'dependency-graph-button',
        data: {
          creatureId: this.model._id,
        },
      });
    },
  },
};
</script>

<style lang="css" scoped>

</style>
