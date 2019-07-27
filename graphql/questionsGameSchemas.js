const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean
} = require('graphql');

const GraphQLDate = require('graphql-date');

var GameModel = require('../models').Game;
var GuessModel = require('../models').Guess;
var QuestionModel = require('../models').Question;
var UserModel = require('../models').User;

var userType = new GraphQLObjectType({
  name: 'user',
  fields: function() {
    return {
      id: {
        type: GraphQLInt
      },
      username: {
        type: GraphQLString
      },
      password: {
        type: GraphQLString
      },
      email: {
        type: GraphQLString
      },
      firstName: {
        type: GraphQLString
      },
      lastName: {
        type: GraphQLString
      },

      createdAt: {
        type: GraphQLDate
      },
      updatedAt: {
        type: GraphQLDate
      },
      fullName: {
        type: GraphQLString,
        resolve: function(root, params) {
          return root.firstName + ' ' + root.lastName;
        }
      }
    };
  }
});

var guessType = new GraphQLObjectType({
  name: 'guess',
  fields: function() {
    return {
      id: {
        type: GraphQLInt
      },
      word: {
        type: GraphQLString
      },
      gameId: {
        type: GraphQLInt
      },
      createdAt: {
        type: GraphQLDate
      },
      updatedAt: {
        type: GraphQLDate
      },
      game: {
        type: gameType,
        resolve: function(root, params) {
          return GameModel.findByPk(root.gameId);
        }
      }
    };
  }
});

var questionType = new GraphQLObjectType({
  name: 'question',
  fields: function() {
    return {
      id: {
        type: GraphQLInt
      },
      question: {
        type: GraphQLString
      },
      answer: {
        type: GraphQLString
      },
      gameId: {
        type: GraphQLInt
      },
      createdAt: {
        type: GraphQLDate
      },
      updatedAt: {
        type: GraphQLDate
      },
      game: {
        type: gameType,
        resolve: function(root, params) {
          return GameModel.findByPk(root.gameId);
        }
      }
    };
  }
});

var gameType = new GraphQLObjectType({
  name: 'game',
  fields: function() {
    return {
      id: {
        type: GraphQLInt
      },
      word: {
        type: GraphQLString
      },
      player1Id: {
        type: GraphQLInt
      },
      player2Id: {
        type: GraphQLInt
      },
      isFinished: {
        type: GraphQLBoolean
      },
      createdAt: {
        type: GraphQLDate
      },
      updatedAt: {
        type: GraphQLDate
      },
      player1: {
        type: userType,
        resolve: function(root, params) {
          return UserModel.findByPk(root.player1Id);
        }
      },
      player2: {
        type: userType,
        resolve: function(root, params) {
          return UserModel.findByPk(root.player2Id);
        }
      },
      questions: {
        type: GraphQLList(questionType),
        resolve: function(root, params) {
          return QuestionModel.findAll({
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'question', 'answer', 'createdAt', 'updatedAt'],
            where: {
              gameId: root.id
            }
          });
        }
      },
      guesses: {
        type: GraphQLList(guessType),
        resolve: function(root, params) {
          return GuessModel.findAll({
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'word', 'createdAt', 'updatedAt'],
            where: {
              gameId: root.id
            }
          });
        }
      }
    };
  }
});

var jwtType = new GraphQLObjectType({
  name: 'jwt',
  fields: function() {
    return {
      id: {
        type: GraphQLInt
      },
      token: {
        type: GraphQLString
      }
    };
  }
});

var guessResultType = new GraphQLObjectType({
  name: 'guessResult',
  fields: function() {
    return {
      result: {
        type: GraphQLBoolean
      }
    };
  }
});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: function() {
    return {
      games: {
        type: new GraphQLList(gameType),
        resolve: function() {
          const games = GameModel.findAll({
            where: {
              isFinished: false
            },
            order: [['createdAt', 'DESC']]
          });

          if (!games) {
            throw new Error('Error');
          }

          return games;
        }
      },
      gamesFinished: {
        type: new GraphQLList(gameType),
        resolve: function() {
          const games = GameModel.findAll({
            where: {
              isFinished: true
            },
            order: [['createdAt', 'DESC']]
          });

          if (!games) {
            throw new Error('Error');
          }

          return games;
        }
      },
      game: {
        type: gameType,
        args: {
          id: {
            name: 'id',
            type: GraphQLInt
          }
        },
        resolve: function(root, params) {
          const game = GameModel.findByPk(params.id);

          if (!game) {
            throw new Error('Error');
          }

          return game;
        }
      },
      users: {
        type: new GraphQLList(userType),
        resolve: function() {
          const users = UserModel.findAll({
            order: [['createdAt', 'DESC']]
          });

          if (!users) {
            throw new Error('Error');
          }

          return users;
        }
      },
      user: {
        type: jwtType,
        args: {
          username: {
            name: 'username',
            type: GraphQLString
          },
          password: {
            name: 'password',
            type: GraphQLString
          }
        },
        resolve: async function(root, params) {
          const user = await UserModel.findOne({
            where: {
              username: params.username
            }
          });

          if (!user) {
            throw new Error('Invalid user or password');
          }

          const validPassword = await bcrypt.compare(
            params.password,
            user.password
          );

          if (validPassword) {
            throw new Error('Invalid user or password');
          }

          var token = jsonwebtoken.sign(
            {
              id: user.id,
              email: user.email
            },
            process.env.JWT_SECRET,
            {
              expiresIn: '1y'
            }
          );

          return {
            id: user.id,
            token
          };
        }
      },
      questions: {
        type: GraphQLList(questionType),
        args: {
          gameId: {
            name: 'gameId',
            type: GraphQLInt
          }
        },
        resolve: function(root, params) {
          const questions = QuestionModel.findAll({
            order: [['createdAt', 'DESC']],
            attributes: [
              'id',
              'question',
              'answer',
              'gameId',
              'createdAt',
              'updatedAt'
            ],
            where: {
              gameId: params.gameId
            }
          });

          if (!questions) {
            throw new Error('Error');
          }

          return questions;
        }
      },
      question: {
        type: questionType,
        args: {
          id: {
            name: 'id',
            type: GraphQLInt
          }
        },
        resolve: function(root, params) {
          const question = QuestionModel.findByPk(params.id);

          if (!question) {
            throw new Error('Error');
          }

          return question;
        }
      },
      guesses: {
        type: GraphQLList(guessType),
        args: {
          gameId: {
            name: 'gameId',
            type: GraphQLInt
          }
        },
        resolve: function(root, params) {
          const guess = GuessModel.findAll({
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'word', 'createdAt', 'updatedAt'],
            where: {
              gameId: params.gameId
            }
          });

          if (!guess) {
            throw new Error('Error');
          }

          return guess;
        }
      },
      guess: {
        type: guessType,
        args: {
          id: {
            name: 'id',
            type: GraphQLInt
          }
        },
        resolve: function(root, params) {
          const guess = GuessModel.findByPk(params.id);

          if (!guess) {
            throw new Error('Error');
          }

          return guess;
        }
      }
    };
  }
});

var mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: function() {
    return {
      createUser: {
        type: jwtType,
        args: {
          username: {
            type: new GraphQLNonNull(GraphQLString)
          },
          password: {
            type: new GraphQLNonNull(GraphQLString)
          },
          email: {
            type: new GraphQLNonNull(GraphQLString)
          },
          firstName: {
            type: new GraphQLNonNull(GraphQLString)
          },
          lastName: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: async function(root, params) {
          const user = new UserModel(params);
          user.password = await bcrypt.hash(user.password, 10);
          const newUser = await user.save();

          if (!newUser) {
            throw new Error('Error');
          }

          var token = jsonwebtoken.sign(
            {
              id: newUser.id,
              email: newUser.email
            },
            process.env.JWT_SECRET,
            {
              expiresIn: '1y'
            }
          );

          return {
            id: newUser.id,
            token
          };
        }
      },
      createGame: {
        type: gameType,
        args: {
          word: {
            type: new GraphQLNonNull(GraphQLString)
          },
          token: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: function(root, params) {
          const decoded = jsonwebtoken.verify(
            params.token,
            process.env.JWT_SECRET
          );

          if (!decoded) {
            throw new Error('Error');
          }

          const game = new GameModel(params);
          game.player1Id = decoded.id;
          const newGame = game.save();

          if (!newGame) {
            throw new Error('Error');
          }

          return newGame;
        }
      },
      joinGame: {
        type: gameType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          token: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: async function(root, params) {
          const decoded = jsonwebtoken.verify(
            params.token,
            process.env.JWT_SECRET
          );

          if (!decoded) {
            throw new Error('Error');
          }

          const game = await GameModel.findByPk(params.id);

          if (game.player2Id !== null) {
            throw new Error('Error');
          }

          game.player2Id = decoded.id;

          const updatedGame = game.save();

          if (!updatedGame) {
            throw new Error('Error');
          }

          return updatedGame;
        }
      },
      createQuestion: {
        type: questionType,
        args: {
          question: {
            type: new GraphQLNonNull(GraphQLString)
          },
          gameId: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          token: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: async function(root, params) {
          const decoded = jsonwebtoken.verify(
            params.token,
            process.env.JWT_SECRET
          );

          if (!decoded) {
            throw new Error('Error');
          }

          const question = new QuestionModel(params);

          const game = await GameModel.findByPk(question.gameId);

          if (game.player2Id !== decoded.id) {
            throw new Error('Error');
          }

          const newQuestion = question.save();

          if (!newQuestion) {
            throw new Error('Error');
          }

          return newQuestion;
        }
      },
      answerQuestion: {
        type: questionType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          answer: {
            type: new GraphQLNonNull(GraphQLBoolean)
          },
          token: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: async function(root, params) {
          const decoded = jsonwebtoken.verify(
            params.token,
            process.env.JWT_SECRET
          );

          if (!decoded) {
            throw new Error('Error');
          }

          const question = await QuestionModel.findByPk(params.id);

          const game = await GameModel.findByPk(question.gameId);

          if (game.player1Id !== decoded.id) {
            throw new Error('Error');
          }

          question.answer = params.answer;
          console.log(question);
          const updatedQuestion = question.save();

          if (!updatedQuestion) {
            throw new Error('Error');
          }

          return updatedQuestion;
        }
      },
      createGuess: {
        type: guessResultType,
        args: {
          word: {
            type: new GraphQLNonNull(GraphQLString)
          },
          gameId: {
            type: new GraphQLNonNull(GraphQLInt)
          },
          token: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: async function(root, params) {
          const decoded = jsonwebtoken.verify(
            params.token,
            process.env.JWT_SECRET
          );

          if (!decoded) {
            throw new Error('Error');
          }

          const guess = new GuessModel(params);

          const game = await GameModel.findByPk(guess.gameId);

          if (game.player2Id !== decoded.id) {
            throw new Error('Error');
          }

          const newGuess = guess.save();

          if (!newGuess) {
            throw new Error('Error');
          }

          if (guess.word === game.word) {
            game.isFinished = true;
            const updatedGame = game.save();

            if (!updatedGame) {
              throw new Error('Error');
            }
          } else {
            var count = await QuestionModel.count({
              col: 'id',
              where: {
                gameId: guess.gameId
              }
            });

            if (count >= 20) {
              game.isFinished = true;
              const updatedGame2 = game.save();

              if (!updatedGame2) {
                throw new Error('Error');
              }
            }
          }

          return {
            result: guess.word === game.word
          };
        }
      }
    };
  }
});

module.exports = new GraphQLSchema({ query: queryType, mutation });
