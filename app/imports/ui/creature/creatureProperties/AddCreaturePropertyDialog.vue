<template lang="html">
  <selectable-property-dialog
    :value="type"
    no-library-only-props
    @input="e => type = e"
  >
    <dialog-base
      :override-back-button="back"
    >
      <template slot="toolbar">
        <v-toolbar-title class="mr-4">
          <template v-if="customProperty">
            New
          </template>{{ typeName }}
        </v-toolbar-title>
        <v-slide-x-transition>
          <text-field
            v-if="!customProperty"
            prepend-inner-icon="mdi-magnify"
            regular
            hide-details
            :value="searchValue"
            :debounce="400"
            @change="searchChanged"
          />
        </v-slide-x-transition>
        <v-scale-transition>
          <v-btn
            v-if="!customProperty"
            fab
            small
            elevation="0"
            class="mr-2"
            color="accent"
            @click="customProperty = true"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-scale-transition>
      </template>
      <v-slide-x-transition
        class="unwrapped-content"
        leave-absolute
      >
        <div
          v-if="customProperty"
          key="custom-property-form"
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
        </div>
        <div
          v-else
          key="library-search"
        >
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
                    class="my-0 py-0 mr-2"
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
                  <v-spacer />
                  <v-btn
                    v-if="open"
                    icon
                    class="flex-grow-0"
                    @click.stop="openPropertyDetails(libraryNode._id)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
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
        </div>
      </v-slide-x-transition>
      <template slot="actions">
        <v-btn
          text
          @click="$store.dispatch('popDialogStack')"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="customProperty"
          text
          color="primary"
          :disabled="!valid"
          @click="$store.dispatch('popDialogStack', model)"
        >
          create
        </v-btn>
        <v-btn
          v-else
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
  </selectable-property-dialog>
</template>

<script lang="js">
  import SelectablePropertyDialog from '/imports/ui/properties/shared/SelectablePropertyDialog.vue';
  import LibraryNodes from '/imports/api/library/LibraryNodes.js';
  import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
  import { getPropertyName } from '/imports/constants/PROPERTIES.js';
  import TreeNodeView from '/imports/ui/properties/treeNodeViews/TreeNodeView.vue';
  import LibraryNodeExpansionContent from '/imports/ui/library/LibraryNodeExpansionContent.vue';
  import schemaFormMixin from '/imports/ui/properties/forms/shared/schemaFormMixin.js';
  import propertyFormIndex from '/imports/ui/properties/forms/shared/propertyFormIndex.js';
  import propertySchemasIndex from '/imports/api/properties/propertySchemasIndex.js';
  import Libraries from '/imports/api/library/Libraries.js';

  export default {
    components: {
      ...propertyFormIndex,
      SelectablePropertyDialog,
      DialogBase,
      TreeNodeView,
      LibraryNodeExpansionContent,
    },
    mixins: [schemaFormMixin],
    props: {
      forcedType: {
        type: String,
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
      customProperty: false,
      debounceTime: 0,
    };},
    computed: {
      typeName(){
        return getPropertyName(this.type) || 'Property';
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
      back(){
        if (this.customProperty){
          this.customProperty = false;
        } else if (this.forcedType){
          this.$store.dispatch('popDialogStack');
        } else {
          this.type = undefined;
        }
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
      }
    },
    meteor: {
      '$subscribe':{
        'searchLibraryNodes': [],
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
