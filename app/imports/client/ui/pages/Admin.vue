<template lang="html">
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <h4>
              {{ $t('Admin.LXTHgSF1tubXs3CFnmXfg', versions ? [versions.dbVersion] : []) }}
            </h4>
            <h4 v-if="schemaVersion == versions.dbVersion ">
              {{ $t('Admin.s9-XR2o7KdT_49MUfVuGS') }}
            </h4>
            <h4 v-else>
              {{ $t('Admin.kj687tcN7d_rd0NRQwjrq', [schemaVersion]) }}
            </h4>
            <h4>
              {{ $t('Admin.RXGFbQYVBuIb-ZpEi04a5', versions ? [versions.dbVersion] : []) }} 
            </h4>
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
              outlined
            >
              {{ $t('Admin.pULxpo5cEC6lP9yRWxhOv') }}
            </v-alert>
            <v-btn
              :disabled="!(schemaVersion > (versions && versions.dbVersion))"
              :loading="loadingMigration"
              @click="migrate"
            >
              {{ $t('Admin.aVWrjxgTf04VdvWZfa52Y', [schemaVersion]) }}
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

<script lang="js">
import getVersion from '/imports/migrations/methods/getVersion';
import migrateTo from '/imports/migrations/methods/migrateTo';
import SCHEMA_VERSION from '/imports/constants/SCHEMA_VERSION';

export default {
  data(){return {
    loadingVersion: false,
    versions: {},
    migrationInput: undefined,
    versionError: undefined,
    migrateError: undefined,
    loadingMigration: false,
    schemaVersion: SCHEMA_VERSION,
  }},
  mounted(){
    this.refreshVersions();
  },
  methods: {
    refreshVersions(){
      this.loadingVersion = true;
      getVersion.call((error, result) => {
        this.loadingVersion = false;
        this.versionError = error;
        this.versions = result;
      });
    },
    migrate(){
      this.loadingMigration = true;
      migrateTo.call({
        version: SCHEMA_VERSION,
      }, error => {
        this.loadingMigration = false;
        this.migrateError = error;
        this.refreshVersions();
      });
    }
  }
}
</script>

<style lang="css" scoped>
</style>
