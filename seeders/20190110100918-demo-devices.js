const tableName = 'Devices';

const devices = Array.from(
  { length: 1000 },
  (v, i) => ({
    code: `1${(i + 1).toString().padStart(4, '0')}`,
    description: `Устройство: ${i + 1}`
  })
);

module.exports = {
  up: queryInterface => queryInterface.bulkInsert(tableName, devices, {}),
  down: queryInterface => queryInterface.bulkDelete(tableName, null, {})
};
