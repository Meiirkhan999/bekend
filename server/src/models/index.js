const path = require('path');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
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
