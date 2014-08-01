/**
 * Sequelize model for Users.
 * @param sequelize The Sequelize instance.
 * @param DataTypes The data types.
 * @returns {Object} The Sequelize model.
 */
module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            isEmail: true
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        birthDate: {
            type: DataTypes.DATE,
            allowNull: true,
            get: function () {
                // Return a date object without the time
                // See: https://github.com/sequelize/sequelize/issues/1514
                var date = new Date(this.getDataValue('birthDate'));
                return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
            }
        },
        phone: DataTypes.STRING,
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: 'users',
        classMethods: {
            associate: function (models) {
                User.hasOne(models.Host, { onDelete: 'cascade' });
                User.hasOne(models.Wwoofer, { onDelete: 'cascade' });
                User.hasMany(models.Membership, { onDelete: 'cascade', as: 'memberships' });
            }
        },
        instanceMethods: {
            /**
             * Add transient properties to comply with Ember data serializer.
             * @returns {Object} The modified instance object.
             */
            toJSON: function () {
                // Add a 'wwooferId' and 'hostId' in the payload
                var json = this.values;
                json.passwordHash = undefined;
                json.wwooferId = json.wwoofer ? json.wwoofer.id : null;
                json.hostId = json.host ? json.host.id : null;
                return json;
            }
        }
    });
    return User
};