# Wwoof France

This application is aimed to allow french farmers and wwoofers to meet and prepare their wwoofing experience.

This application is beeing developed by volonteers and will eventually replace the current [french wwoofing](http://www.wwoof.fr) website.

## Getting started
* Install:
    * [Node.js](http://nodejs.org): `brew install node` on OS X
    * [Brunch](http://brunch.io): `npm install -g brunch`
    * [Bower](http://bower.io): `npm install -g bower`
    * Node.js and Bower packages: `npm install & bower install`
    * MySql server and client
* Configure:
    * Edit the `config/config.json` file at the root of the project.
    * Create the MySQL schema for the main database and the session database (see config file).
* Run:
    * Terminal 1: `brunch watch` — watches the project with continuous rebuild.
    * Terminal 2: `node-dev server.js` — runs the Node.js server using Express.
* Good to know:
    * The `public/` dir is fully auto-generated and served by HTTP server.
    * Place in `app/assets/` static files you want to be copied to `public/`.
    * Write the Ember code in the `app/` dir.
    * Write the Express code in the `server/` dir.