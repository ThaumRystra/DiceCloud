<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title class="mr-4">
        <template v-if="tab === 2">
          New
        </template>{{ typeName }}
      </v-toolbar-title>
      <v-spacer />
      <v-slide-x-reverse-transition hide-on-leave>
        <v-switch
          v-if="tab === 0"
          :model-value="showPropertyHelp"
          append-icon="mdi-help"
          hide-details
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
    <template #toolbar-extension>
      <v-tabs
        v-model="tab"
      >
        <v-tab :disabled="!!forcedType">
          {{ typeName || 'Type' }}
        </v-tab>
        <v-tab :disabled="!type">
          Create
        </v-tab>
        <v-tab
          v-if="!hideLibraryTab"
          :disabled="!type"
        >
          Library
        </v-tab>
      </v-tabs>
    </template>
    <template #unwrapped-content>
      <v-window
        v-model="tab"
        class="fill-height overflow-y-auto"
      >
      <v-window-item :disabled="!!forcedType">
        <property-selector
          :no-library-only-props="!showLibraryOnlyProps"
          :parent-type="parentDoc && parentDoc.type"
          :current-type="type"
          @select="e => type = e"
        />
      </v-window-item>
      <v-window-item
        :disabled="!type"
        class="dialog-background"
        style="min-height: 100%;"
      >
        <v-card-text
          v-if="!$slots['unwrapped-content']"
          class="dialog-background"
        >
          <property-form
            v-if="type"
            class="creature-property-form"
            no-child-insert
            :model="model"
            :errors="errors"
            :collection="collection"
            @change="change"
            @push="push"
            @pull="pull"
          />
        </v-card-text>
      </v-window-item>
      <v-window-item
        v-if="!hideLibraryTab"
        :disabled="!type"
      >
        <v-expansion-panels
          accordion
          rounded="0"
          multiple
          hover
        >
          <v-expansion-panel
            v-for="libraryNode in libraryNodes"
            :key="libraryNode._id"
            :model="libraryNode"
            :data-id="libraryNode._id"
          >
            <v-expansion-panel-title>
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
                <div class="d-flex flex-column">
                  <tree-node-view :model="libraryNode" />
                  <div class="text-caption">
                    {{ libraryNames[libraryNode.ancestors[0].id ] }}
                  </div>
                </div>
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
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <library-node-expansion-content :model="libraryNode" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <div class="d-flex justify-center">
          <v-fade-transition mode="out-in">
            <div
              v-if="hasMore"
              class="d-flex justify-center align-stretch"
            >
              <v-btn
                v-if="hasMore"
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
        </div>
      </v-window-item>
    </v-window>
    </template>
    <template #actions>
      <v-btn
        variant="text"
        @click="$store.dispatch('popDialogStack')"
      >
        {{ tab === 1 ? "Discard" : "Cancel" }}
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="tab === 1"
        variant="text"
        color="primary"
        :disabled="!valid"
        @click="$store.dispatch('popDialogStack', model)"
      >
        create
      </v-btn>
      <v-btn
        v-else-if="tab === 2"
        variant="text"
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

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, provide } from 'vue';
import { autorun, subscribe } from 'vue-meteor-tracker';
import { useStore } from 'vuex';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import PROPERTIES, { getPropertyName } from '/imports/constants/PROPERTIES';
import TreeNodeView from '/imports/client/ui/properties/treeNodeViews/TreeNodeView.vue';
import LibraryNodeExpansionContent from '/imports/client/ui/library/LibraryNodeExpansionContent.vue';
import propertySchemasIndex from '/imports/api/properties/propertySchemasIndex';
import Libraries from '/imports/api/library/Libraries';
import getThemeColor from '/imports/client/ui/utility/getThemeColor';
import PropertySelector from '/imports/client/ui/properties/shared/PropertySelector.vue';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import PropertyForm from '/imports/client/ui/properties/PropertyForm.vue';

const props = withDefaults(defineProps<{
  creatureId?: string;
  forcedType?: string;
  suggestedTypes?: string[];
  collection?: string;
  suggestedType?: string;
  parentDoc?: Record<string, any>;
  prop?: Record<string, any>;
  children?: any[];
  hideLibraryTab?: boolean;
  showLibraryOnlyProps?: boolean;
}>(), {
  creatureId: undefined,
  forcedType: undefined,
  suggestedTypes: undefined,
  collection: undefined,
  suggestedType: undefined,
  parentDoc: undefined,
  prop: undefined,
  children: () => [],
  hideLibraryTab: false,
  showLibraryOnlyProps: false,
});

const store = useStore();

const selectedNodeIds = ref<string[]>([]);
const type = ref<string | undefined>(props.forcedType || props.suggestedType || props.prop?.type || undefined);
const model = ref<Record<string, any>>(props.prop || { type: type.value, children: [] });
const searchValue = ref<string | undefined>(undefined);
const debounceTime = ref(0);
const tab = ref(0);
const currentLimit = ref(32);
const schema = ref<any>(null);
const validationContext = ref<any>(null);
const valid = ref(true);

// Reactive provide for context
const isLibraryForm = computed(() => props.collection === 'libraryNodes' || undefined);
const contextToProvide = reactive({ debounceTime, isLibraryForm });
provide('context', contextToProvide);

// Reactive subscriptions
autorun(() => {
  subscribe('searchLibraryNodes', props.creatureId, type.value, searchValue.value, currentLimit.value);
  subscribe('selectedLibraryNodes', selectedNodeIds.value);
});

const { result: showPropertyHelp } = autorun(() => {
  const user = Meteor.user();
  return !(user?.preferences?.hidePropertySelectDialogHelp);
});

const { result: libraryNodes } = autorun(() =>
  LibraryNodes.find({ _searchResult: true }, {
    sort: { name: 1, type: 1, left: 1 },
  }).fetch()
);

const { result: libraryNames } = autorun(() => {
  const names: Record<string, string> = {};
  Libraries.find().forEach((lib: any) => { names[lib._id] = lib.name; });
  return names;
});

// Computed
const typeName = computed(() => getPropertyName(type.value) || 'Property');
const toolbarColor = computed(() => getThemeColor('secondary'));
const docsPath = computed(() => {
  const propDef = (PROPERTIES as any)[type.value as string];
  return propDef && propDef.docsPath;
});
const hasMore = computed(() =>
  libraryNodes.value && libraryNodes.value.length >= currentLimit.value
);

const errors = computed(() => {
  valid.value = true;
  if (!model.value) return {};
  if (!validationContext.value) return {};
  const cleanModel = validationContext.value.clean(model.value, { getAutoValues: false });
  validationContext.value.validate(cleanModel);
  const errs: Record<string, string> = {};
  validationContext.value.validationErrors().forEach((error: any) => {
    if (valid.value) valid.value = false;
    errs[error.name] = schema.value.messageForError(error);
  });
  return errs;
});

// Watchers
watch(type, (newType) => { changeType(newType); });
watch(() => props.prop, (newProp) => { if (newProp) model.value = newProp; });

onMounted(() => { changeType(type.value); });

// Methods
function changeType(newType: string | undefined) {
  if (!newType) return;
  tab.value = 1;
  schema.value = (propertySchemasIndex as any)[newType];
  validationContext.value = schema.value.newContext();
  let currentModel = model.value || {};
  currentModel = schema.value.clean(currentModel);
  currentModel.type = newType;
  model.value = currentModel;
}

function change({ path, value, ack }: { path: string | string[]; value: any; ack?: Function }) {
  const pathArray = Array.isArray(path) ? path : [path];
  let obj = model.value as any;
  for (let i = 0; i < pathArray.length - 1; i++) {
    const key = pathArray[i];
    if (!obj[key]) obj[key] = {};
    obj = obj[key];
  }
  obj[pathArray[pathArray.length - 1]] = value;
  if (ack) ack();
}

function push({ path, value, ack }: { path: string | string[]; value: any; ack?: Function }) {
  const pathArray = Array.isArray(path) ? path : [path];
  let obj = model.value as any;
  for (let i = 0; i < pathArray.length - 1; i++) {
    obj = obj[pathArray[i]];
  }
  const lastKey = pathArray[pathArray.length - 1];
  if (!obj[lastKey]) {
    obj[lastKey] = [value];
  } else {
    obj[lastKey].push(value);
  }
  if (ack) ack();
}

function pull({ path, ack }: { path: string | string[]; ack?: Function }) {
  const pathArray = Array.isArray(path) ? path : [path];
  let arr = model.value as any;
  for (let i = 0; i < pathArray.length - 1; i++) {
    arr = arr[pathArray[i]];
  }
  const index = Number(pathArray[pathArray.length - 1]);
  if (Array.isArray(arr)) {
    arr.splice(index, 1);
  }
  if (ack) ack();
}

async function propertyHelpChanged(value: boolean) {
  try {
    await Meteor.users.setPreference.callAsync({
      preference: 'hidePropertySelectDialogHelp',
      value: !value,
    });
  } catch (error: any) {
    console.error(error);
    snackbar({ text: error.reason });
  }
}

function helpDialog() {
  store.commit('pushDialogStack', {
    component: 'help-dialog',
    elementId: 'help-button',
    data: { path: docsPath.value },
  });
}

function searchChanged(val: string, ack: Function) {
  searchValue.value = val;
  currentLimit.value = 32;
  setTimeout(ack, 200);
}

function loadMore() {
  if (!hasMore.value) return;
  currentLimit.value += 32;
}

function openPropertyDetails(id: string) {
  store.commit('pushDialogStack', {
    component: 'library-node-dialog',
    elementId: id,
    data: { _id: id },
  });
}
</script>

<style lang="css" scoped>
.dialog-background {
  background-color: #fafafa;
}

.v-theme--dark .dialog-background {
  background-color: #303030;
}
</style>
