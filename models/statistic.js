module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Statistic', {
    code: DataTypes.STRING,
    city: DataTypes.STRING,
    description: DataTypes.STRING,
    active: DataTypes.BOOLEAN
  }, {});

  Device.associate = models => {
    Device.hasMany(
      models.Statistic,
      { as: 'Statistics', foreignKey: 'deviceId' }
    );
  };

  return Device;
};
