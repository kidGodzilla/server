/**
 * Sequelize model for Hosts.
 * @param sequelize The Sequelize instance.
 * @param DataTypes The data types.
 * @returns {Object} The Sequelize model.
 */
module.exports = function (sequelize, DataTypes) {
    var Host = sequelize.define('Host', {
        oldHostId: DataTypes.STRING, // Host id from the old database
        farmName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { len: [5, 50] }
        },
        shortDescription: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { len: [5, 255] }
        }, // (location)
        fullDescription: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: { len: [5, 1500] }
        }, // (entry)
        webSite: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: { isUrl: true }
        },
        travelDetails: DataTypes.STRING,
        noPhone: DataTypes.BOOLEAN,
        noEmail: DataTypes.BOOLEAN,
        note: DataTypes.STRING, // (legend)
        // Whether the host is pending validation from an admin
        isPending: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        // Whether the host has been manually disabled by an admin
        isSuspended: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'hosts',
        classMethods: {
            associate: function (models) {
                Host.hasMany(models.Photo, { onDelete: 'cascade', as: 'photos' });
                Host.belongsTo(models.User);
                Host.belongsTo(models.Address)
            }
        }
    });
    return Host
};