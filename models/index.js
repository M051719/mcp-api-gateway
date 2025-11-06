import Api from './api.js';
import User from './user.js';
import ApiKey from './apiKey.js';
import UsageLog from './usageLog.js';

// Associations
Api.hasMany(UsageLog, { foreignKey: 'api_id' });
UsageLog.belongsTo(Api, { foreignKey: 'api_id' });

User.hasMany(ApiKey, { foreignKey: 'user_id' });
ApiKey.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UsageLog, { foreignKey: 'user_id' });
UsageLog.belongsTo(User, { foreignKey: 'user_id' });

export { Api, User, ApiKey, UsageLog };
