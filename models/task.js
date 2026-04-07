const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Task", {
    title: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    dueDate: DataTypes.DATE,
    status: { type: DataTypes.STRING, defaultValue: "pending" },
    userId: { type: DataTypes.STRING, allowNull: false }
  });
};