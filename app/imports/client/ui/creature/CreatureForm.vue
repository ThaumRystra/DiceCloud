<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { autorun, subscribe } from 'vue-meteor-tracker';
import { union, without, debounce } from 'lodash';
import FormSection, { FormSections } from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import LibraryList from '/imports/client/ui/library/LibraryList.vue';
import LibraryCollections from '/imports/api/library/LibraryCollections';
import { changeAllowedLibraries, toggleAllUserLibraries } from '/imports/api/creature/creatures/methods/changeAllowedLibraries';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import SmartImageInput from '/imports/client/ui/components/global/SmartImageInput.vue';
import { key } from '/imports/client/ui/vuexStore';

const props = withDefaults(defineProps<{
  stored?: boolean;
  model?: Record<string, any>;
  errors?: Record<string, any>;
  attackForm?: boolean;
  disabled?: boolean;
}>(), {
  stored: false,
  model: () => ({}),
  errors: () => ({}),
  attackForm: false,
  disabled: false,
});

const emit = defineEmits(['change']);
const store = useStore(key);

const libraryCollections = ref(props.model.allowedLibraryCollections);
const libraries = ref(props.model.allowedLibraries);
const libraryWriteLoading = ref(false);
const libraryWriteError = ref<any>(undefined);
const dirty = ref(false);

const allUserLibraries = computed(() =>
  !props.model.allowedLibraries && !props.model.allowedLibraryCollections
);

watch(() => props.model?.allowedLibraryCollections, (newVal) => {
  if (!dirty.value) libraryCollections.value = newVal;
});

watch(() => props.model?.allowedLibraries, (newVal) => {
  if (!dirty.value) libraries.value = newVal;
});

autorun(() => {
  subscribe('libraries');
});

const { result: librariesSelectedByCollections } = autorun(() => {
  let ids: string[] = [];
  if (!props.model.allowedLibraryCollections) return ids;
  LibraryCollections.find({
    _id: { $in: props.model.allowedLibraryCollections },
  }).forEach((collection: any) => {
    ids = union(ids, collection.libraries);
  });
  return ids;
});

const { result: editPermission } = autorun(() => {
  try {
    assertEditPermission(props.model, Meteor.userId());
    return true;
  } catch (e) {
    return false;
  }
});

let updateAllowedLibraryCollections: ReturnType<typeof debounce>;
let updateAllowedLibraries: ReturnType<typeof debounce>;

onMounted(() => {
  updateAllowedLibraryCollections = debounce(async () => {
    libraryWriteLoading.value = true;
    dirty.value = false;
    try {
      await changeAllowedLibraries.callAsync({
        _id: props.model._id,
        allowedLibraryCollections: libraryCollections.value,
      });
      libraryWriteError.value = undefined;
    } catch (error) {
      libraryWriteError.value = error;
    }
    libraryWriteLoading.value = false;
  }, 500);

  updateAllowedLibraries = debounce(async () => {
    libraryWriteLoading.value = true;
    dirty.value = false;
    try {
      await changeAllowedLibraries.callAsync({
        _id: props.model._id,
        allowedLibraries: libraries.value,
      });
      libraryWriteError.value = undefined;
    } catch (error) {
      libraryWriteError.value = error;
    }
    libraryWriteLoading.value = false;
  }, 500);
});

function changeShowTreeTab(value: boolean) {
  const currentTab = store.getters.tabNameById(props.model._id);
  if (!value && currentTab === 'tree') {
    store.commit('setTabForCharacterSheet', { id: props.model._id, tab: 'build' });
  }
  emit('change', { path: ['settings', 'showTreeTab'], value: !!value });
}

function changeHideSpellsTab(value: boolean) {
  const currentTab = store.getters.tabNameById(props.model._id);
  if (!value && currentTab === 'spells') {
    store.commit('setTabForCharacterSheet', { id: props.model._id, tab: 'actions' });
  }
  emit('change', { path: ['settings', 'hideSpellsTab'], value: !value });
}

async function allUserLibrariesChange(value: boolean, ack: Function) {
  try {
    await toggleAllUserLibraries.callAsync({ _id: props.model._id, value });
    ack();
  } catch (error) {
    ack(error);
  }
}

function selectLibrary(id: string, val: boolean) {
  if (val) {
    libraries.value = union(libraries.value, [id]);
  } else {
    libraries.value = without(libraries.value, id);
  }
  dirty.value = true;
  updateAllowedLibraries();
}

function selectLibraryCollection(id: string, val: boolean) {
  if (val) {
    libraryCollections.value = union(libraryCollections.value, [id]);
  } else {
    libraryCollections.value = without(libraryCollections.value, id);
  }
  dirty.value = true;
  updateAllowedLibraryCollections();
}

function showDependencyGraph() {
  store.commit('pushDialogStack', {
    component: 'dependency-graph-dialog',
    elementId: 'dependency-graph-button',
    data: { creatureId: props.model._id },
  });
}
</script>

<template lang="html">
  <div class="creature-form">
    <text-field
      label="Name"
      :disabled="!editPermission"
      :value="model.name"
      :error-messages="errors.name"
      @change="(value, ack) => $emit('change', { path: ['name'], value, ack })"
    />
    <text-field
      label="Alignment"
      :disabled="!editPermission"
      :value="model.alignment"
      :error-messages="errors.alignment"
      @change="(value, ack) => $emit('change', { path: ['alignment'], value, ack })"
    />
    <text-field
      label="Gender"
      :disabled="!editPermission"
      :value="model.gender"
      :error-messages="errors.gender"
      @change="(value, ack) => $emit('change', { path: ['gender'], value, ack })"
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
          @change="(value, ack) => $emit('change', { path: ['picture'], value, ack })"
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
          @change="(value, ack) => $emit('change', { path: ['avatarPicture'], value, ack })"
        />
      </v-col>
    </v-row>
    <form-sections>
      <form-section name="Settings">
        <v-switch
          label="Hide redundant stats"
          :disabled="!editPermission"
          :model-value="model.settings.hideUnusedStats"
          @update:model-value="value => $emit('change', { path: ['settings', 'hideUnusedStats'], value: !!value })"
        />
        <v-switch
          label="Hide rest buttons"
          :disabled="!editPermission"
          :model-value="model.settings.hideRestButtons"
          @update:model-value="value => $emit('change', { path: ['settings', 'hideRestButtons'], value: !!value })"
        />
        <v-switch
          label="Show spells tab"
          :disabled="!editPermission"
          :model-value="!model.settings.hideSpellsTab"
          @update:model-value="changeHideSpellsTab"
        />
        <v-switch
          label="Show tree tab"
          :disabled="!editPermission"
          :model-value="model.settings.showTreeTab"
          @update:model-value="changeShowTreeTab"
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
          @change="(value, ack) => $emit('change', { path: ['settings', 'hitDiceResetMultiplier'], value, ack })"
        />
        <text-field
          label="Discord Webhook URL"
          hint="This creature's logs will be posted to the discord channel"
          placeholder="https://discordapp.com/api/webhooks/<id>/<token>"
          :disabled="!editPermission"
          :value="model.settings.discordWebhook"
          @change="(value, ack) => $emit('change', { path: ['settings', 'discordWebhook'], value, ack })"
        />
        <!--
        <v-switch
          label="Use variant encumbrance"
          :model-value="model.settings.useVariantEncumbrance"
          :error-messages="errors.useVariantEncumbrance"
          @change="value => $emit('change', {path: ['settings','useVariantEncumbrance'], value})"
        />
        <v-switch
          label="Hide spells tab"
          :model-value="model.settings.hideSpellcasting"
          :error-messages="errors.hideSpellcasting"
          @change="value => $emit('change', {path: ['settings','hideSpellcasting'], value})"
        />
        <v-switch
          label="Swap ability scores and modifiers"
          :model-value="model.settings.swapStatAndModifier"
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
          variant="text"
          prepend-icon="mdi-graph"
          @click="showDependencyGraph"
        >
          Dependency Graph
        </v-btn>
      </form-section>
    </form-sections>
  </div>
</template>

<style lang="css" scoped></style>
