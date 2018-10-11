<template>
	<ToolbarLayout>
		<div slot="toolbar">Sign Up</div>
		<v-form ref="form" class="mt-4">
			<v-layout column align-center>
				<v-img
				src="crown-dice-logo-cropped-transparent.png"
				width="120px"
				class="ma-3"></v-img>
				<v-text-field
					type="text"
					label="Email"
					v-model="email"
		      :rules="emailRules"
		      @keyup.enter="submit"
		      required
				></v-text-field>
				<v-text-field
					type="text"
					label="Username"
					v-model="username"
		      :rules="usernameRules"
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
				<v-text-field
					type="password"
					label="Password Again"
					v-model="password2"
		      :rules="password2Rules"
		      @keyup.enter="submit"
					required
				></v-text-field>
				<div class="error--text">
					{{error}}
				</div>
				<v-layout row>
					<v-btn
						:disabled="!valid"
						@click="submit"
						color="accent"
					>
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
				Register in with Google
			</v-btn>
		</v-layout>
	</ToolbarLayout>
</template>

<script>
	import ToolbarLayout from "/imports/ui/layouts/ToolbarLayout.vue";
	import router from "/imports/ui/router.js";
	export default{
		data() {
			return {
	      valid: true,
				username: "",
	      usernameRules: [
	        v => !!v || "Name is required",
	      ],
				email: "",
	      emailRules: [
	        v => !!v || "Name is required",
        	v => /.+@.+/.test(v) || 'E-mail must be valid',
	      ],
				password: "",
	      passwordRules: [
	        v => !!v || "Password is required",
	      ],
				password2: "",
	      password2Rules: [
	        v => !!v || "Password is required",
					v => v == this.password || "Passwords don't match",
	      ],
				error: "",
				googleError: "",
	    }
		},
		methods: {
      submit () {
        if (this.$refs.form.validate()) {
					Accounts.createUser({
						username: this.username,
						password: this.password,
						email: this.email,
					}, error => {
						if (error){
							this.error = error.reason;
						} else {
							router.push("characterList");
						}
					});
        }
      },
			googleLogin() {
				Meteor.loginWithGoogle(error => {
					if (error) this.googleError = error.reason;
				});
			},
    },
    components: {
      ToolbarLayout,
    },
	}
</script>
