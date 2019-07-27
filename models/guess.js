'use strict';
module.exports = (sequelize, DataTypes) => {
  const Guess = sequelize.define('Guess', {
    word: DataTypes.STRING
  }, {});
  Guess.associate = function(models) {
    
  };
  return Guess;
};