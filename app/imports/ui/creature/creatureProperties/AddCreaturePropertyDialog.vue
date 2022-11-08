<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <v-toolbar-title class="mr-4">
        <template v-if="tab === 2">
          New
        </template>{{ typeName }}
      </v-toolbar-title>
      <v-spacer />
      <v-slide-x-reverse-transition hide-on-leave>
        <v-switch
          v-if="tab === 0"
          :input-value="showPropertyHelp"
          append-icon="mdi-help"
          hide-details
          flat
          @change="propertyHelpChanged"
        />
        <v-btn 
          v-if="tab === 1"
          icon
          data-id="help-button"
          @click="helpDialog"
        >
          <v-icon>mdi-help</v-icon>
        </v-btn>
        <v-switch
          v-if="tab === 0"
          :input-value="showPropertyHelp"
          append-icon="mdi-help"
          hide-details
          flat
          @change="propertyHelpChanged"
        />
        <text-field
          v-if="tab === 2"
          prepend-inner-icon="mdi-magnify"
          regular
          hide-details
          :value="searchValue"
          :debounce="400"
          @change="searchChanged"
        />
      </v-slide-x-reverse-transition>
    </template>
    <v-tabs
      slot="toolbar-extension"
      v-model="tab"
    >
      <v-tab :disabled="!!forcedType">
        {{ typeName || 'Type' }}
      </v-tab>
      <v-tab :disabled="!type">
        Create
      </v-tab>
      <v-tab :disabled="!type">
        Library
      </v-tab>
    </v-tabs>
    <v-tabs-items
      slot="unwrapped-content"
      v-model="tab"
      class="fill-height overflow-y-auto"
    >
      <v-tab-item :disabled="!!forcedType">
        <property-selector
          no-library-only-props
          :parent-type="parentDoc && parentDoc.type"
          @select="e => type = e"
        />
      </v-tab-item>
      <v-tab-item :disabled="!type">
        <v-card-text
          v-if="!$slots['unwrapped-content']"
        >
          <component
            :is="type"
            v-if="type"
            class="creature-property-form"
            :model="model"
            :errors="errors"
            @change="change"
            @push="push"
            @pull="pull"
          />
        </v-card-text>
      </v-tab-item>
      <v-tab-item :disabled="!type">
        <v-expansion-panels
          multiple
          inset
        >
          <v-expansion-panel
            v-for="libraryNode in libraryNodes"
            :key="libraryNode._id"
            :model="libraryNode"
            :data-id="libraryNode._id"
          >
            <v-expansion-panel-header>
              <template #default="{ open }">
                <v-checkbox
                  v-model="selectedNodeIds"
                  class="my-0 py-0 mr-2 flex-grow-0"
                  hide-details
                  :value="libraryNode._id"
                  :disabled="!selectedNodeIds.includes(libraryNode._id) &&
                    selectedNodeIds.length >= 20"
                  @click.stop
                />
                <v-layout column>
                  <tree-node-view :model="libraryNode" />
                  <div class="text-caption">
                    {{ libraryNames[libraryNode.ancestors[0].id ] }}
                  </div>
                </v-layout>
                <template v-if="open">
                  <v-spacer />
                  <v-btn
                    icon
                    class="flex-grow-0"
                    @click.stop="openPropertyDetails(libraryNode._id)"
                  >
                    <v-icon>mdi-window-restore</v-icon>
                  </v-btn>
                </template>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <library-node-expansion-content :model="libraryNode" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-layout
          justify-center
        >
          <v-fade-transition mode="out-in">
            <div
              v-if="currentLimit < countAll"
              class="layout justify-center align-stretch"
            >
              <v-btn
                v-if="currentLimit < countAll"
                key="load-more-btn"
                :loading="!$subReady.searchLibraryNodes"
                color="accent"
                class="ma-4"
                @click="loadMore"
              >
                Load More
              </v-btn>
            </div>
          </v-fade-transition>
        </v-layout>
      </v-tab-item>
    </v-tabs-items>
    <template slot="actions">
      <v-btn
        text
        @click="$store.dispatch('popDialogStack')"
      >
        Cancel
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="tab === 1"
        text
        color="primary"
        :disabled="!valid"
        @click="$store.dispatch('popDialogStack', model)"
      >
        create
      </v-btn>
      <v-btn
        v-else-if="tab === 2"
        text
        color="primary"
        :disabled="!selectedNodeIds.length"
        @click="$store.dispatch('popDialogStack', selectedNodeIds)"
      >
        <template v-if="selectedNodeIds.length >= 15">
          {{ selectedNodeIds.length }}/20
        </template>
        Insert
      </v-btn>
    </template>
  </dialog-base>
</template>

<script lang="js">
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import PROPERTIES, { getPropertyName } from '/imports/constants/PROPERTIES.js';
import TreeNodeView from '/imports/ui/properties/treeNodeViews/TreeNodeView.vue';
import LibraryNodeExpansionContent from '/imports/ui/library/LibraryNodeExpansionContent.vue';
import schemaFormMixin from '/imports/ui/properties/forms/shared/schemaFormMixin.js';
import propertyFormIndex from '/imports/ui/properties/forms/shared/propertyFormIndex.js';
import propertySchemasIndex from '/imports/api/properties/propertySchemasIndex.js';
import Libraries from '/imports/api/library/Libraries.js';
import getThemeColor from '/imports/ui/utility/getThemeColor.js';
import PropertySelector from '/imports/ui/properties/shared/PropertySelector.vue';
import {snackbar} from '/imports/ui/components/snackbars/SnackbarQueue.js';

export default {
  components: {
    PropertySelector,
    DialogBase,
    TreeNodeView,
    LibraryNodeExpansionContent,
    ...propertyFormIndex,
  },
  mixins: [schemaFormMixin],
  props: {
    creatureId: {
      type: String,
      default: undefined,
    },
    forcedType: {
      type: String,
      default: undefined,
    },
    suggestedTypes: {
      type: Array,
      default: undefined,
    },
    suggestedType: {
      type: String,
      default: undefined,
    },
    parentDoc: {
      type: Object,
      default: undefined,
    },
  },
  reactiveProvide: {
    name: 'context',
    include: ['debounceTime'],
  },
  data(){return {
    selectedNodeIds: [],
    type: this.forcedType || this.suggestedType,
    model: {
      type: this.type,
    },
    searchValue: undefined,
    debounceTime: 0,
    tab: 0,
  };},
  computed: {
    typeName(){
      return getPropertyName(this.type) || 'Property';
    },
    toolbarColor(){
      return getThemeColor('secondary');
    },
    docsPath() {
      const propDef = PROPERTIES[this.type];
      return propDef && propDef.docsPath;
    },
  },
  watch: {
    type(newType){
      this.changeType(newType);
    },
  },
  mounted(){
    this.changeType(this.type);
  },
  methods: {

    propertyHelpChanged(value){
      Meteor.users.setPreference.call({
        preference: 'hidePropertySelectDialogHelp',
        value: !value
      }, error => {
        if (!error) return;
        console.error(error);
        snackbar({
          text: error.reason,
        });
      });
    },
    helpDialog() {
      this.$store.commit('pushDialogStack', {
        component: 'help-dialog',
        elementId: 'help-button',
        data: {
          path: this.docsPath,
        },
      });
    },
    searchChanged(val, ack){
      this._subs.searchLibraryNodes.setData('searchTerm', val);
      this._subs.searchLibraryNodes.setData('limit', undefined);
      this.selectedNode = undefined;
      this.searchValue = val;
      setTimeout(ack, 200);
    },
    loadMore(){
      if (this.currentLimit >= this.countAll) return;
      this._subs.searchLibraryNodes.setData('limit', this.currentLimit + 32);
    },
    insert(){
      if (!this.selectedNodeIds.length) return;
      this.$store.dispatch('popDialogStack', this.selectedNodeIds);
    },
    changeType(type){
      this._subs.searchLibraryNodes.setData('type', type);
      if (!type) return;
      this.tab = 1;
      this.schema = propertySchemasIndex[type];
      this.validationContext = this.schema.newContext();
      let model = this.schema.clean({});
      model.type = type;
      this.model = model;
    },
    openPropertyDetails(id){
      this.$store.commit('pushDialogStack', {
        component: 'library-node-dialog',
        elementId: id,
        data: {
          _id: id,
        },
      });
    },
  },
  meteor: {
    '$subscribe':{
      'searchLibraryNodes'() {
        return [this.creatureId]
      },
      'selectedLibraryNodes'(){
        return [this.selectedNodeIds];
      },
    },
    showPropertyHelp(){
      let user = Meteor.user();
      return !(user?.preferences?.hidePropertySelectDialogHelp)
    },
    currentLimit(){
      return this._subs.searchLibraryNodes.data('limit') || 32;
    },
    countAll(){
      return this._subs.searchLibraryNodes.data('countAll');
    },
    libraryNodes(){
      return LibraryNodes.find({
        _searchResult: true
      },{
        sort: {
          'ancestors.0.id': 1,
          name: 1,
          order: 1,
        },
      });
    },
    libraryNames(){
      let names = {};
      Libraries.find().forEach(lib => names[lib._id] = lib.name)
      return names;
    }
  }
};
</script>

<style lang="css" scoped>
</style>
