import Vue from 'vue';

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    meteor?: any;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $subscribe: (name: string, params: any[]) => void;
    $autorun: (fn: () => void) => number;
    $subReady: Record<string, boolean>;
  }
}