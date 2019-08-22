module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Device', {
    code: DataTypes.STRING,
    city: DataTypes.STRING,
    description: DataTypes.STRING,
    appVersionCode: DataTypes.INTEGER
  }, {});

  Device.associate = models => {
    Device.hasMany(
      models.Statistic,
      { as: 'Statistics', foreignKey: 'deviceId' }
    );
  };

  return Device;
};
