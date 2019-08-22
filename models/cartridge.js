module.exports = (sequelize, DataTypes) => {
  const Cartridge = sequelize.define('Cartridge', {
    code: DataTypes.STRING,
    quantityResource: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN
  }, {});

  Cartridge.associate = models => {
    Cartridge.hasMany(
      models.Statistic,
      { as: 'Cartridges', foreignKey: 'cartridgeId' }
    );
  };


  return Cartridge;
};
