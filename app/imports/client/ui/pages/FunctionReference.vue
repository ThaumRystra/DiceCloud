<script setup lang="ts">
import functions from '/imports/parser/functions';
import { computed } from 'vue';

const functionList = computed(() => {
  const fns: any[] = [];
  for (const name in functions) {
    const f = (functions as any)[name];
    fns.push({ name, ...f });
  }
  return fns;
});
</script>

<template>
  <v-container class="documentation">
    <v-row justify="center">
      <v-col
        cols="12"
        lg="8"
      >
        <v-card>
          <v-card-text class="markdown">
            <h1>Functions</h1>
            <div
              v-for="fn in functionList"
              :key="fn.name"
              class="mb-3"
            >
              <h3>{{ fn.name }}</h3>
              <div class="my-2">
                {{ fn.comment }}
              </div>
              <table style="min-width: initial;">
                <tr
                  v-for="example in fn.examples"
                  :key="example.input"
                >
                  <td>
                    <code>{{ example.input }}</code>
                  </td>
                  <td>
                    <v-icon>mdi-arrow-right</v-icon>
                  </td>
                  <td>
                    <code>{{ example.result }}</code>
                  </td>
                </tr>
              </table>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
