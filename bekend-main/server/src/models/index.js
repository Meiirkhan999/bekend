const path = require('path');
const { Sequelize } = require('sequelize');

const dialect = process.env.DB_DIALECT || 'sqlite';

const sequelize =
  dialect === 'postgres'
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: process.env.NODE_ENV === 'production' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
      })
    : new Sequelize({
        dialect: 'sqlite',
        storage: path.resolve(__dirname, '../../database.sqlite'),
        logging: false,
      });

const User = require('./user')(sequelize);
const Supply = require('./supply')(sequelize);

// Associations
User.hasMany(Supply, { foreignKey: 'createdBy' });
Supply.belongsTo(User, { foreignKey: 'createdBy' });

module.exports = { sequelize, User, Supply };
