'use strict';
module.exports = function(sequelize, DataTypes) {
  var Purchase = sequelize.define('Purchase', {
    itemId: DataTypes.STRING,
    moneyGiven: DataTypes.INTEGER,
    moneyRequired: DataTypes.INTEGER,
    changeTendered: DataTypes.INTEGER
  }, {});

  Purchase.associate = function(models){
      Purchase.belongsTo(models.Item, {
          as: 'items',
          foreignKey: 'itemId'

      })
  }
  return Purchase;
};
