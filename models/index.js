/**
 *  Configures a connection to the database and to collects all model definitions.
 */
var fs = require('fs'),
    config = require('../config/config')(),
    path = require('path'),
    Sequelize = require('sequelize'),
    lodash = require('lodash'),
    sequelize = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password, {
            host: config.mysql.host,
            port: config.mysql.port
        }),
    db = {};

// Create all tables
fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== 'index.js')
    })
    .forEach(function (file) {
        var model = sequelize.import(path.join(__dirname, file));
        console.log('Load table for ' + model.name + ' model');
        db[model.name] = model
    });

// Create all associations
Object.keys(db).forEach(function (modelName) {
    if ('associate' in db[modelName]) {
        console.log('Load associations for ' + modelName + ' model');
        db[modelName].associate(db)
    }
});

module.exports = lodash.extend({
    sequelize: sequelize,
    Sequelize: Sequelize
}, db);