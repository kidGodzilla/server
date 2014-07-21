/**
 * Loads the appropriate configuration based on the current Node environment.
 */
module.exports = function() {
    switch(process.env.NODE_ENV) {
        case 'development':
            return require('./development');
        case 'production':
            return require('./production');
        default:
            return require('./development');
    }
};