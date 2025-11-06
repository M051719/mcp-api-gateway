import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const ApiKey = sequelize.define('ApiKey', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: sequelize.literal('uuid_generate_v4()')
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  key: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  revoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 'api_keys',
  timestamps: false
});

export default ApiKey;
