'use strict';
module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define('Game', {
    word: DataTypes.STRING,
    isFinished: DataTypes.BOOLEAN
  }, {});
  Game.associate = function(models) {
    Game.belongsTo(models.User, {
      foreignKey: 'player1Id'
    });
    Game.belongsTo(models.User, {
      foreignKey: 'player2Id'
    });
    Game.hasMany(models.Question, {as: 'questions', foreignKey: 'gameId'});
    Game.hasMany(models.Guess, {as: 'guesses', foreignKey: 'gameId'});
  };
  return Game;
};