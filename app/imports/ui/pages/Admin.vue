<template lang="html">
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <h4>Database version: {{ versions && versions.dbVersion }}</h4>
            <h4>Git version: {{ versions && versions.gitVersion }}</h4>
            <v-alert
              v-if="versionError"
              type="error"
            >
              {{ versionError }}
            </v-alert>
            <v-btn
              icon
              @click="refreshVersions"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-text-field
              v-model="migrationInput"
              label="Database version to migrate to"
            />
            <v-btn
              :disabled="!migrationInput"
              :loading="loadingMigration"
              @click="migrate"
            >
              Migrate
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
import getVersion from '/imports/migrations/methods/getVersion.js';
import migrateTo from '/imports/migrations/methods/migrateTo.js';

export default {
  data(){return {
    loadingVersion: false,
    versions: {},
    migrationInput: undefined,
    versionError: undefined,
    migrateError: undefined,
    loadingMigration: false,
  }},
  mounted(){
    this.refreshVersions();
  },
  methods: {
    refreshVersions(){
      getVersion.call((error, result) => {
        this.versionError = error;
        this.versions = result;
      });
    },
    migrate(){
      let version = this.migrationInput;
      if (Number.isFinite(+version)){
        version = +version;
      }
      this.loadingMigration = true;
      migrateTo.call({
        version,
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
