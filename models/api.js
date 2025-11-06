import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const Api = sequelize.define('Api', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: sequelize.literal('uuid_generate_v4()')
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  config: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('now()')
  }
}, {
  tableName: 'apis',
  timestamps: false
});

export default Api;
