<template>
  <div>
    <h4>Login</h4>
    <b-form @submit="onSubmit">
      <label for="username">Username</label>
      <div>
        <b-input id="username" type="text" v-model.trim="user.username" required autofocus />
      </div>
      <div>
        <label for="password">Password</label>
        <div>
          <b-input id="password" type="password" v-model.trim="user.password" required />
        </div>
      </div>
      <div>
        <label for="email">E-mail</label>
        <div>
          <b-input id="email" type="email" v-model.trim="user.email" required />
        </div>
      </div>
      <div>
        <label for="firstName">First Name</label>
        <div>
          <b-input id="firstName" type="text" v-model.trim="user.firstName" required />
        </div>
      </div>
      <div>
        <label for="lastName">Last Name</label>
        <div>
          <b-input id="lastName" type="text" v-model.trim="user.lastName" required />
        </div>
      </div>
      <div>
        <b-button class="mt-1" type="submit" variant="primary">Register</b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
import gql from "graphql-tag";
import router from "../../router";

const CREATE_USER = gql`
  mutation CreateUser(
    $username: String!
    $password: String!
    $email: String!
    $firstName: String!
    $lastName: String!
  ) {
    createUser(
      username: $username
      password: $password
      email: $email
      firstName: $firstName
      lastName: $lastName
    ) {
      id
      token
    }
  }
`;

export default {
  name: "Register",
  data() {
    return {
      user: {}
    };
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      this.$apollo
        .mutate({
          mutation: CREATE_USER,
          variables: {
            username: this.user.username,
            password: this.user.password,
            email: this.user.email,
            firstName: this.user.firstName,
            lastName: this.user.lastName
          }
        })
        .then(data => {
          localStorage.setItem("token", data.data.createUser.token);
          localStorage.setItem("userId", data.data.createUser.id);
          this.$parent.token = data.data.createUser.token;
          router.push({ name: "Home" });
        });
      //.catch(error => {
      //console.error(error);
      //});
    }
  }
};
</script>