/**
 * Sequelize model for Wwoofers.
 * @param sequelize The Sequelize instance.
 * @param DataTypes The data types.
 * @returns {Object} The Sequelize model.
 */
module.exports = function (sequelize, DataTypes) {
    var Wwoofer = sequelize.define('Wwoofer', {
        firstName2: DataTypes.STRING,
        lastName2: DataTypes.STRING,
        birthDate2: {
            type: DataTypes.DATE,
            get: function () {
                // Return a date object without the time
                // See: https://github.com/sequelize/sequelize/issues/1514
                var date = new Date(this.getDataValue('birthDate2'));
                return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
            }
        },
        nationality: DataTypes.STRING,
        tripDuration: DataTypes.STRING,
        tripMotivation: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: { len: [5, 1500] }
        },
        intro: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: { len: [5, 1500] }
        },
        comment: DataTypes.STRING
        //paymentStatus: DataTypes.INTEGER,
        //memId: DataTypes.STRING,
        //txnId: DataTypes.STRING,
        //deletionDate: DataTypes.DATE
    }, {
        tableName: 'wwoofers',
        classMethods: {
            associate: function (models) {
                Wwoofer.belongsTo(models.User);
                Wwoofer.belongsTo(models.Address)
            }
        }
    });
    return Wwoofer
};