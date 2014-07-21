/**
 *  Configures a connection to the database and to collects all model definitions.
 */
var fs = require('fs'),
    config = require('../config/config')(),
    path = require('path'),
    Sequelize = require('sequelize'),
    lodash = require('lodash'),
    sequelize = new Sequelize(config.mysql.schema, config.mysql.username, config.mysql.password),
    db = {};

// Create all tables
fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== 'index.js')
    })
    .forEach(function (file) {
        var model = sequelize.import(path.join(__dirname, file));
        console.log('Create table for ' + model.name + ' model');
        db[model.name] = model
    });

// Create all associations
Object.keys(db).forEach(function (modelName) {
    if ('associate' in db[modelName]) {
        console.log('Create associations for ' + modelName + ' model');
        db[modelName].associate(db)
    }
});

module.exports = lodash.extend({
    sequelize: sequelize,
    Sequelize: Sequelize
}, db);