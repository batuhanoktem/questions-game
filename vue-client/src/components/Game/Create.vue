<template>
  <div>
    <h4>Create Game</h4>
    <b-form @submit="onSubmit">
      <label for="word">Word</label>
      <div>
        <b-input id="word" type="text" v-model.trim="game.word" required autofocus />
      </div>
      <div>
        <b-button class="m-1" type="submit" variant="primary">Create</b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
import gql from "graphql-tag";
import router from "../../router";

const CREATE_GAME = gql`
  mutation CreateGame($word: String!, $token: String!) {
    createGame(word: $word, token: $token) {
      id
    }
  }
`;

export default {
  name: "CreateGame",
  data() {
    return {
      game: {}
    };
  },
  methods: {
    onSubmit(evt) {
      evt.preventDefault();
      this.$apollo
        .mutate({
          mutation: CREATE_GAME,
          variables: {
            word: this.game.word,
            token: localStorage.getItem("token")
          }
        })
        .then(() => {
          router.push({ name: "ListGame" });
        });
      //.catch(error => {
      //  console.error(error);
      //});
    }
  }
};
</script>