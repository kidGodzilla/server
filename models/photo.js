/**
 * Sequelize model for Photos.
 * @param sequelize The Sequelize instance.
 * @param DataTypes The data types.
 * @returns {Object} The Sequelize model.
 */
var path = require('path'),
    photoFolder = '\\public\\host_photos\\',
    appDir = path.dirname(require.main.filename);

module.exports = function (sequelize, DataTypes) {
    var Photo = sequelize.define('Photo', {
        fileName: DataTypes.STRING,
        caption: DataTypes.STRING
    }, {
        tableName: 'photos',
        classMethods: {
            associate: function (models) {
                Photo.belongsTo(models.Host, { onDelete: 'cascade' })
            },
            getFullPath: function (fileName) {
                return appDir + photoFolder + fileName;
            }
        }
    });
    return Photo
};