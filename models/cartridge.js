'use strict';

module.exports = (sequelize, DataTypes) => {
  const Cartridge = sequelize.define('Cartridge', {
    code: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    printed: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN,
    lastActive: DataTypes.DATE,
    lastDeviceId: DataTypes.INTEGER
  }, {});

  return Cartridge;
};
