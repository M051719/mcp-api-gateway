import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const UsageLog = sequelize.define('UsageLog', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: sequelize.literal('uuid_generate_v4()')
  },
  api_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  path: DataTypes.TEXT,
  method: DataTypes.TEXT,
  status: DataTypes.INTEGER,
  duration_ms: DataTypes.INTEGER,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 'usage_logs',
  timestamps: false
});

export default UsageLog;
