import users from './users.js';
import devices from './devices.js';
import cartridges from './cartridges.js';
import roles from './roles.js';
import statistics from './statistics.js';

export * from './users.js';
export * from './devices.js';
export * from './cartridges.js';
export * from './roles.js';
export * from './statistics.js';

export default {
  ...users,
  ...devices,
  ...cartridges,
  ...roles,
  ...statistics
};
