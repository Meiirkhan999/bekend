const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Supply', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    location: { type: DataTypes.STRING, allowNull: true },
    createdBy: { type: DataTypes.STRING, allowNull: false },
  }, {
    timestamps: true,
  });
};
