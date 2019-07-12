'use strict';

module.exports = (sequelize, DataTypes) => {
  const Cartridge = sequelize.define('Cartridge', {
    code: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    balance: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN,
    lastActive: DataTypes.DATE,
    lastDevice: DataTypes.STRING
  }, {});

  return Cartridge;
};
