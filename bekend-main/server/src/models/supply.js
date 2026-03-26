const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Supply', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Equipment' },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    availability: { type: DataTypes.STRING, allowNull: false, defaultValue: 'In Stock' },
    manufacturer: { type: DataTypes.STRING, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    location: { type: DataTypes.STRING, allowNull: true },
    createdBy: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  }, {
    timestamps: true,
  });
};
