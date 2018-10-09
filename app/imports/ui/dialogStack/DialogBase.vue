<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <slot name="toolbar"></slot>
    </v-toolbar>
    <v-layout>
      <slot></slot>
    </v-layout>
    <v-card-actions>
      <slot name="actions"></slot>
    </v-card-actions>
  </v-card>
</template>
