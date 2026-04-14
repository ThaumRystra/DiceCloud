<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const form = ref<any>(null);
const valid = ref(true);
const submitLoading = ref(false);
const email = ref('');
const emailRules = [
  (v: string) => !!v || 'E-mail is required',
  (v: string) => /.+@.+/.test(v) || 'E-mail must be valid',
];
const password = ref('');
const passwordRules = [
  (v: string) => !!v || 'Password is required',
];
const password2 = ref('');
const password2Rules = computed(() => [
  (v: string) => !!v || 'Password is required',
  (v: string) => v === password.value || 'Passwords don\'t match',
]);
const error = ref('');
const info = ref('');

const token = computed(() => route.params.token as string | undefined);

async function submit() {
  const { valid: isValid } = await form.value?.validate() ?? { valid: false };
  if (!isValid) return;
  if (token.value) {
    submitLoading.value = true;
    Accounts.resetPassword(token.value, password.value, (err: any) => {
      submitLoading.value = false;
      error.value = err?.message ?? '';
      info.value = '';
      if (!err) {
        router.push('/characterList');
      }
    });
  } else {
    submitLoading.value = true;
    Accounts.forgotPassword({ email: email.value }, (err: any) => {
      submitLoading.value = false;
      error.value = err?.message ?? '';
      info.value = '';
      if (!err) {
        info.value = `Password reset link sent to ${email.value}`;
        email.value = '';
        valid.value = true;
      }
    });
  }
}
</script>

<template>
  <div>
    <v-form
      ref="form"
      class="mt-4"
    >
      <div
        class="d-flex flex-column align-center"
      >
        <v-img
          src="crown-dice-logo-cropped-transparent.png"
          width="120px"
          class="ma-3"
        />

        <template v-if="token">
          <v-text-field
            v-model="password"
            type="password"
            label="New Password"
            :rules="passwordRules"
            class="ma-2"
            variant="outlined"
            required
            @keyup.enter="submit"
          />
          <v-text-field
            v-model="password2"
            type="password"
            label="Password Again"
            :rules="password2Rules"
            class="ma-2"
            variant="outlined"
            required
            @keyup.enter="submit"
          />
        </template>
        <v-text-field
          v-else
          v-model="email"
          type="text"
          label="Email"
          :rules="emailRules"
          class="ma-2"
          variant="outlined"
          required
          @keyup.enter="submit"
        />
        <v-expand-transition>
          <v-alert
            v-if="error"
            type="error"
          >
            {{ error }}
          </v-alert>
        </v-expand-transition>
        <v-expand-transition>
          <v-alert
            v-if="info"
            type="info"
          >
            {{ info }}
          </v-alert>
        </v-expand-transition>
        <div class="d-flex">
          <v-btn
            :disabled="!valid"
            color="accent"
            @click="submit"
          >
            Reset Password
          </v-btn>
        </div>
      </div>
    </v-form>
  </div>
</template>
