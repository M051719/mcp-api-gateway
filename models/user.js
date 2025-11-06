import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: sequelize.literal('uuid_generate_v4()')
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false
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
  tableName: 'users',
  timestamps: false
});

export default User;
