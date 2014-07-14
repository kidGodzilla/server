/**
 * Sequelize model for French Departments.
 * @param sequelize The Sequelize instance.
 * @param DataTypes The data types.
 * @returns {Object} The Sequelize model.
 */
module.exports = function (sequelize, DataTypes) {
    var Department = sequelize.define('Department', {
        code: DataTypes.STRING,
        name: DataTypes.STRING,
        region: DataTypes.STRING
    }, {
        tableName: 'departments',
        classMethods: {
            associate: function (models) {
                Department.hasMany(models.Address)
            }
        }
    });
    return Department
};