'use strict';
module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    question: DataTypes.STRING,
    answer: DataTypes.BOOLEAN
  }, {});
  Question.associate = function(models) {
    
  };
  return Question;
};