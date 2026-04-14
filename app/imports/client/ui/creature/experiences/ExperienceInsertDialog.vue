<template lang="html">
  <dialog-base>
    <template #toolbar>
      <v-toolbar-title>
        Add Experience
      </v-toolbar-title>
    </template>
    <experience-form
      :start-as-milestone="startAsMilestone"
      :model="model"
      :errors="errors"
      @change="change"
      @push="push"
      @pull="pull"
    />
    <template #actions>
      <div class="d-flex justify-end">
        <v-btn
          variant="text"
          :disabled="!valid"
          @click="insertExperience"
        >
          Insert
        </v-btn>
      </div>
    </template>
  </dialog-base>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue';
import { useStore } from 'vuex';
import { get, toPath } from 'lodash';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import ExperienceForm from '/imports/client/ui/creature/experiences/ExperienceForm.vue';
import { ExperienceSchema, insertExperience } from '/imports/api/creature/experience/Experiences';
import { key } from '/imports/client/ui/vuexStore';

const props = defineProps<{
  creatureIds: string[];
  startAsMilestone?: boolean;
}>();

const store = useStore(key);

provide('context', { debounceTime: 0 });

const schema = ExperienceSchema.omit('creatureId');
const startingModel: any = {};
if (props.startAsMilestone) startingModel.levels = 1;
const model = ref(schema.clean(startingModel));
const validationContext = schema.newContext();

const valid = ref(true);

const errors = computed(() => {
  valid.value = true;
  if (!model.value) throw new Error('model must be set');
  const cleanModel = validationContext.clean(model.value, { getAutoValues: false });
  validationContext.validate(cleanModel);
  const errs: Record<string, string> = {};
  validationContext.validationErrors().forEach((error: any) => {
    if (valid.value) valid.value = false;
    errs[error.name] = schema.messageForError(error);
  });
  return errs;
});

function resolvePath(obj: any, path: any) {
  const arrayPath = toPath(path);
  if (arrayPath.length === 1) return { object: obj, key: arrayPath[0] };
  const key = arrayPath.slice(-1)[0];
  const objectPath = arrayPath.slice(0, -1);
  let object = obj;
  objectPath.forEach((pathKey: string) => {
    if (!object[pathKey]) object[pathKey] = {};
    object = object[pathKey];
  });
  return { object, key };
}

function change({ path, value, ack }: any) {
  const { object, key } = resolvePath(model.value, path);
  object[key] = value;
  if (ack) ack();
}

function push({ path, value, ack }: any) {
  const array = get(model.value, path);
  if (array === undefined) {
    const { object, key } = resolvePath(model.value, path);
    object[key] = [value];
  } else if (!array.push) {
    throw `${Array.isArray(path) ? path.join('.') : path} doesn't have push`;
  } else {
    array.push(value);
  }
  if (ack) ack();
}

function pull({ path, ack }: any) {
  const { object, key } = resolvePath(model.value, path);
  if (!object || !object.splice) throw `${Array.isArray(path) ? path.join('.') : path} doesn't have splice`;
  object.splice(Number(key), 1);
  if (ack) ack();
}

async function insertExperienceFn() {
  const experience = schema.clean(model.value);
  try {
    const id = await insertExperience.callAsync({
      experience,
      creatureIds: props.creatureIds,
    });
    store.dispatch('popDialogStack', id);
  } catch (error) {
    console.error(error);
  }
}
</script>

<style lang="css" scoped></style>
