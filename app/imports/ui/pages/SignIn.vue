<template>
	<ToolbarLayout>
		<div slot="toolbar">Sign In</div>
		<v-form ref="form" class="mt-4">
			<v-layout column align-center>
				<v-img
				src="crown-dice-logo-cropped-transparent.png"
				width="120px"
				class="ma-3"></v-img>
				<v-text-field
					type="text"
					label="Username or email"
					v-model="name"
		      :rules="nameRules"
		      @keyup.enter="submit"
		      required
				></v-text-field>
				<v-text-field
					type="password"
					label="Password"
					v-model="password"
		      :rules="passwordRules"
		      @keyup.enter="submit"
					required
				></v-text-field>
				<v-btn flat>Reset Password</v-btn>
				<div class="error--text">
					{{error}}
				</div>
				<v-layout row>
					<v-btn
						:disabled="!valid"
						@click="submit"
						color="accent"
					>
						Sign In
					</v-btn>
					<v-btn color="accent" to="/register">
						Register
					</v-btn>
				</v-layout>
			</v-layout>
		</v-form>
		<v-divider class="ma-4"></v-divider>
		<v-layout column align-center>
			<div class="error--text">
				{{googleError}}
			</div>
			<v-btn color="accent" @click="googleLogin">
				Sign in with Google
			</v-btn>
		</v-layout>
	</ToolbarLayout>
</template>

<script>
	import ToolbarLayout from "/imports/ui/layouts/ToolbarLayout.vue";
	import router from "/imports/ui/Router.js";
	export default{
		data: () => ({
      valid: true,
      name: "",
      nameRules: [
        v => !!v || "Name is required",
      ],
      password: "",
      passwordRules: [
        v => !!v || "Password is required",
      ],
			error: "",
			googleError: "",
    }),
		methods: {
      submit () {
				console.log("submitting");
        if (this.$refs.form.validate()) {
					Meteor.loginWithPassword(this.name, this.password, e => {
						if (e){
							this.error = e.reason;
						} else {
							router.push("characterList");
						}
					});
        }
      },
			googleLogin() {
				console.log("logging in with Google");
				Meteor.loginWithGoogle(e => {
					this.googleError = e.message;
				});
			}
    },
    components: {
      ToolbarLayout,
    },
	}
</script>
