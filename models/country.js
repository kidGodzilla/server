/**
 * Sequelize model for Countries.
 * @param sequelize The Sequelize instance.
 * @param DataTypes The data types.
 * @returns {Object} The Sequelize model.
 */
module.exports = function (sequelize, DataTypes) {
    var Country = sequelize.define('Country', {
        code: DataTypes.STRING,
        name: DataTypes.STRING
    }, {
        tableName: 'countries',
        classMethods: {
            associate: function (models) {
                Country.hasMany(models.Address)
            }
        }
    });
    return Country
};