<template>
  <div>
    <b-row>
      <b-col cols="12">
        <b-button class="m-1" variant="primary" href="#/games/create">Create Game</b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <b-table responsive striped hover :items="games" :fields="fields">
          <template slot="actions" scope="row">
            <b-button
              variant="primary"
              v-if="row.item.player1Id === userId || row.item.player2Id === userId"
              @click.stop="details(row.item)"
            >Details</b-button>
            <b-button
              variant="success"
              v-if="row.item.player1Id != userId && row.item.player2Id === null"
              @click.stop="join(row.item)"
            >Join</b-button>
          </template>
        </b-table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import gql from "graphql-tag";
import router from "../../router";

const GET_GAMES = gql`
  {
    games {
      id
      player1Id
      player2Id
      player1 {
        fullName
      }
      player2 {
        fullName
      }
      createdAt
    }
  }
`;

const JOIN_GAME = gql`
  mutation JoinGame($id: Int!, $token: String!) {
    joinGame(id: $id, token: $token) {
      id
    }
  }
`;

export default {
  name: "ListGame",
  apollo: {
    games: {
      query: GET_GAMES,
      pollInterval: 300
    }
  },
  data() {
    return {
      fields: {
        createdAt: { label: "Created At", sortable: true },
        "player1.fullName": { label: "Player 1 Name", sortable: true },
        "player2.fullName": { label: "Player 2 Name", sortable: true },
        actions: { label: "Actions" }
      },
      games: [],
      userId: parseInt(localStorage.getItem("userId"))
    };
  },
  methods: {
    details(game) {
      router.push({ name: "DetailsGame", params: { id: game.id } });
    },
    join(game) {
      this.$apollo
        .mutate({
          mutation: JOIN_GAME,
          variables: {
            id: game.id,
            token: localStorage.getItem("token")
          }
        })
        .then(() => {
          router.push({ name: "DetailsGame", params: { id: game.id } });
        })
        //.catch(error => {
          //console.error(error);
        //});
    }
  }
};
</script>

<style>
</style>
