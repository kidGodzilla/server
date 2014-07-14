/**
 * Sequelize model for Addresses.
 * @param sequelize The Sequelize instance.
 * @param DataTypes The data types.
 * @returns {Object} The Sequelize model.
 */
module.exports = function (sequelize, DataTypes) {
    var Address = sequelize.define('Address', {
        address1: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { len: [5, 255] }
        },
        address2: DataTypes.STRING,
        zipCode: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { len: [2, 10] }
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { len: [2, 255] }
        },
        state: DataTypes.STRING,
        countryId: {
            type: DataTypes.INTEGER,
            allowNull: false
        } // overriden to be non-nullable
    }, {
        tableName: 'addresses',
        classMethods: {
            associate: function (models) {
                Address.belongsTo(models.Department, { foreignKeyConstraint: true });
                Address.belongsTo(models.Country, { foreignKeyConstraint: true, foreignKey: 'countryId' });
                Address.hasOne(models.Wwoofer, { onDelete: 'cascade' });
                Address.hasOne(models.Host, { onDelete: 'cascade' })
            }
        }
    });
    return Address
};