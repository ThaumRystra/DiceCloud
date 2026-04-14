<script setup lang="ts">
import { ref, onMounted } from 'vue';
import getVersion from '/imports/migrations/methods/getVersion';
import migrateTo from '/imports/migrations/methods/migrateTo';
import SCHEMA_VERSION from '/imports/constants/SCHEMA_VERSION';

const loadingVersion = ref(false);
const versions = ref<any>({});
const versionError = ref<any>(undefined);
const migrateError = ref<any>(undefined);
const loadingMigration = ref(false);
const schemaVersion = SCHEMA_VERSION;

async function refreshVersions() {
  loadingVersion.value = true;
  try {
    const result = await getVersion.callAsync();
    versionError.value = undefined;
    versions.value = result;
  } catch (error: any) {
    versionError.value = error;
  }
  loadingVersion.value = false;
}

async function migrate() {
  loadingMigration.value = true;
  try {
    await migrateTo.callAsync({ version: SCHEMA_VERSION });
    migrateError.value = undefined;
  } catch (error: any) {
    migrateError.value = error;
  }
  loadingMigration.value = false;
  refreshVersions();
}

onMounted(() => {
  refreshVersions();
});
</script>

<template lang="html">
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <h4>Current database version: {{ versions && versions.dbVersion }}</h4>
            <h4 v-if="schemaVersion == versions.dbVersion ">
              Database is up to date with latest version. Restart to enable navigation.
            </h4>
            <h4 v-else>
              Expected database version: {{ schemaVersion }}
            </h4>
            <h4>Git version: {{ versions && versions.gitVersion }}</h4>
            <v-alert
              v-if="versionError"
              type="error"
            >
              {{ versionError }}
            </v-alert>
            <v-btn
              icon
              :loading="loadingVersion"
              @click="refreshVersions"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-alert
              type="warning"
              variant="outlined"
            >
              Back up the database before attempting any migration. A failed
              migration can result in profound data loss.
            </v-alert>
            <v-btn
              :disabled="!(schemaVersion > (versions && versions.dbVersion))"
              :loading="loadingMigration"
              @click="migrate"
            >
              Migrate to database version {{ schemaVersion }}
            </v-btn>
            <v-alert
              v-if="migrateError"
              type="error"
            >
              {{ migrateError }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="css" scoped>
</style>
