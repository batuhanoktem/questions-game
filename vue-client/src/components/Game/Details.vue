<template>
  <div>
    <b-row class="m-1">
      <b-col>
        <b-button disabled variant="primary">{{questionRemaining}}</b-button>
      </b-col>
      <b-col v-if="won === null || won === true">
        <b-button disabled variant="success">{{guessRemaining}}</b-button>
      </b-col>
      <b-col v-else-if="won === false">
        <b-button disabled variant="danger" class="text-white">{{guessRemaining}}</b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table responsive striped hover :items="questions" :fields="questionFields">
          <template slot="actions" scope="row" v-if="player1">
            <b-button
              v-if="row.item.answer === null || row.item.answer === 'true'"
              @click.stop="answerQuestion(row.item.id, true)"
              variant="success"
            >Yes</b-button>
            <b-button
              v-if="row.item.answer === null || row.item.answer === 'false'"
              @click.stop="answerQuestion(row.item.id, false)"
              variant="danger"
            >No</b-button>
          </template>
          <template slot="actions" scope="row" v-else-if="player2">
            <b-button
              disabled
              v-if="row.item.answer === 'true'"
              @click.stop="answerQuestion(row.item.id, true)"
              variant="success"
            >Yes</b-button>
            <b-button
              disabled
              v-if="row.item.answer === 'false'"
              @click.stop="answerQuestion(row.item.id, false)"
              variant="danger"
            >No</b-button>
          </template>
        </b-table>
      </b-col>
      <b-col>
        <b-table responsive striped hover :items="guesses" :fields="guessFields"></b-table>
      </b-col>
    </b-row>
    <template v-if="player2">
      <b-row>
        <template v-if="remainingQuestion > 0 && !isFinished">
          <b-col>
            <b-input type="text" placeholder="Question" v-model.trim="question" />
          </b-col>
          <b-col>
            <b-button variant="success" @click.stop="createQuestion">Send</b-button>
          </b-col>
        </template>
        <template v-else>
          <b-col></b-col>
          <b-col></b-col>
        </template>
        <template v-if="!isFinished">
          <b-col>
            <b-input type="text" placeholder="Guess" v-model.trim="guess" />
          </b-col>
          <b-col>
            <b-button variant="success" @click.stop="createGuess">Send</b-button>
          </b-col>
        </template>
      </b-row>
    </template>
  </div>
</template>

<script>
import gql from "graphql-tag";

const GET_GAME = gql`
  query game($id: Int!) {
    game(id: $id) {
      isFinished
      player1Id
      player2Id
    }
  }
`;

const GET_GAME_WORD = gql`
  query game($id: Int!) {
    game(id: $id) {
      word
    }
  }
`;

const GET_QUESTIONS = gql`
  query questions($gameId: Int!) {
    questions(gameId: $gameId) {
      id
      question
      answer
    }
  }
`;

const GET_GUESSES = gql`
  query guesses($gameId: Int!) {
    guesses(gameId: $gameId) {
      id
      word
    }
  }
`;

const ANSWER_QUESTION = gql`
  mutation AnswerQuestion($id: Int!, $answer: Boolean!, $token: String!) {
    answerQuestion(id: $id, answer: $answer, token: $token) {
      answer
    }
  }
`;

const CREATE_QUESTION = gql`
  mutation CreateQuestion($question: String!, $gameId: Int!, $token: String!) {
    createQuestion(question: $question, gameId: $gameId, token: $token) {
      id
    }
  }
`;

const CREATE_GUESS = gql`
  mutation CreateGuess($word: String!, $gameId: Int!, $token: String!) {
    createGuess(word: $word, gameId: $gameId, token: $token) {
      result
    }
  }
`;

export default {
  name: "DetailsGame",

  data() {
    return {
      questionFields: {
        question: {
          label: "Question",
          sortable: true
        },
        actions: {
          label: "Answer"
        }
      },
      guessFields: {
        word: {
          label: "Word",
          sortable: true
        }
      },
      questions: [],
      guesses: [],
      id: parseInt(this.$route.params.id),
      userId: parseInt(localStorage.getItem("userId")),
      isFinished: true,
      player1: false,
      player2: false,
      question: "",
      guess: "",
      player1Id: 0,
      player2Id: 0,
      remainingQuestion: 0,
      won: null
    };
  },
  computed: {
    questionRemaining: function() {
      this.remainingQuestion = 20 - this.questions.length;
      if (this.remainingQuestion > 0) {
        return this.remainingQuestion + " Questions Remaining";
      } else {
        return "No More Questions!";
      }
    },
    guessRemaining: function() {
      /*
      This can be opened if you want guesses also limited

      var remaining = 20 - this.guesses.length;
      if (remaining > 0) {
        return remaining + " Guesses Remaining";
      }
      */

      if (this.won === null) {
        return "Unlimited Guesses until 20 Questions";
      } else if (this.won === true) {
        return "You won!";
      } else {
        return "You lose!";
      }
    }
  },
  created() {
    this.$apollo
      .query({
        query: GET_GAME,
        variables: {
          id: this.id
        }
      })
      .then(data => {
        this.isFinished = data.data.game.isFinished;
        this.player1Id = data.data.game.player1Id;
        this.player2Id = data.data.game.player2Id;

        if (this.player1Id === this.userId) {
          this.player1 = true;
        } else if (this.player2Id === this.userId) {
          this.player2 = true;
        }

        if (this.isFinished) {
          this.$apollo
            .query({
              query: GET_GAME_WORD,
              variables: {
                id: this.id
              }
            })
            .then(data => {
              this.won = data.data.game.word === this.guesses[0].word;
            });
        }
      });
    //.catch(error => {
    //console.error(error);
    //});
  },
  apollo: {
    questions: {
      query: GET_QUESTIONS,
      variables() {
        return {
          gameId: this.id
        };
      },
      pollInterval: 300
    },
    guesses: {
      query: GET_GUESSES,
      variables() {
        return {
          gameId: this.id
        };
      },
      pollInterval: 300
    }
  },
  methods: {
    answerQuestion(id, answer) {
      this.$apollo.mutate({
        mutation: ANSWER_QUESTION,
        variables: {
          id,
          answer,
          token: localStorage.getItem("token")
        }
      });
      //.then(data => {})
      //.catch(error => {
      //console.error(error);
      //});
    },
    createQuestion() {
      this.$apollo
        .mutate({
          mutation: CREATE_QUESTION,
          variables: {
            question: this.question,
            gameId: this.id,
            token: localStorage.getItem("token")
          }
        })
        .then(() => {
          this.question = "";
        });
      //.catch(error => {
      //console.error(error);
      //});
    },
    createGuess() {
      this.$apollo
        .mutate({
          mutation: CREATE_GUESS,
          variables: {
            word: this.guess,
            gameId: this.id,
            token: localStorage.getItem("token")
          }
        })
        .then(data => {
          this.guess = "";
          var result = data.data.createGuess.result;

          if (result === true) {
            this.won = true;
            this.isFinished = true;
          } else if (this.remainingQuestion <= 0) {
            this.won = false;
            this.isFinished = true;
          }
        });
      //.catch(error => {
      //console.error(error);
      //});
    }
  }
};
</script>