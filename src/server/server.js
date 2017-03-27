/**
 * server.js
 *
 * Entry point of the server application.
 *
 *
 * @namespace server
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-09
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import BlueBird from 'bluebird'

// unfortunately native Promises prevent using node domains, so we are using bluebird promise lib
// https://github.com/nodejs/node-v0.x-archive/issues/8648
global.Promise = BlueBird;

import { Server } from 'http';
import Express from 'express';
import BodyParser from 'body-parser';
import Morgan from 'morgan';
import Mongoose from './helper/misc/mongoose';

import React from 'react';

import ConfigServer from './../../config/server';
import ConfigClient from './../../config/client';

import UserModel from './models/user';

import ClientRoutes from './../client/routes';
import ClientNotFoundPage from './../client/pages/NotFoundPage';

import { match as RouterMatch } from 'react-router';
import { renderToString as ReactRenderToString } from 'react-dom/server';
import { RouterContext } from 'react-router';

import MaterialTheme from 'material-ui/styles/getMuiTheme';
import MaterialThemeProvider from 'material-ui/styles/MuiThemeProvider';

import i18n from '../shared/helper/i18n';

import auth from './helper/user/auth';
import Setup from './helper/misc/setup'

import { internalErrorResponse } from './helper/response/errorResponse';

import paths from './helper/paths'

import Scheduler from './helper/scheduler/scheduler'
import { Router } from './helper/misc/router';

/**
 * Entry point of the server application.
 *
 * @class ServerApplication
 */
class ServerApplication {
    constructor() {
        this.app = null;
        this.server = null;

        this.port = ConfigServer.http.port || process.env.PORT || 3000;
        this.env = process.env.NODE_ENV || 'production';

        /**
         * We need to establish first proper db connection, checking for updates (setup)
         * and then we initialize our server.
         */
        new Promise(resolve => resolve())
            .then(result => new Promise((resolve, reject) => this.initDatabase(resolve, reject)))
            .then(result => new Promise((resolve, reject) => Setup.detectAndRunUpdates(resolve, reject)))
            .then(() => {
                this.startServer();

                this.initAppConfig();
                this.initRequests();
                this.initApiRoutes();
                this.initUniversalRoutes();
                Scheduler.detectAndStartSchedules();
            })
            .catch(err => {
                console.log(`Error occurred: ${err}, terminating application`);
                process.exit(0);
            });
    }

    /**
     * Initialize database models and establish database connection
     *
     * @method initDatabase
     * @async
     *
     * @param success {Function} success callback
     * @param error {Function} error callback
     */
    initDatabase(success, error) {
        console.log("Initializing database");

        Mongoose.connect(ConfigServer.db.uri, {
            promiseLibrary: Promise
        });

        Mongoose.connection.on('error', error);
        Mongoose.connection.on('open', success);
    }

    /**
     * Initialize and parse requests by catching all requests, setting proper
     * i18n locales from the request header, checking and preparing the authentication
     * and doing all other stuff when needed before any request is being handled by the other routes.
     * Also useful for injecting middleware to the request
     *
     * @method initRequests
     */
    initRequests() {
        this.app.use("*", (req, res, next) => {
            console.log("-------------------------------");
            console.log(`Request started`);
            console.log("Request body: ", req.body);

            auth().authenticate((err, user) => {
                // we will login, no matter there is an error or not
                // when the auth is failed, we will login a dummy guest user
                // so we can always access the user and use the "isAllowed" method.
                // of course a dummy user (guest) will be in the guest group so we can define
                // what a guest can see or not
                if(!user) {
                    user = new UserModel();
                    user.setAuth(false);
                    console.log("Request is with no authentication.")
                } else {
                    user.setAuth(true);
                    console.log(`Request remote address: ${req.connection.remoteAddress}`);
                    console.log(`Request is with authentication: ${user.name} (${user.id})`);

                    // add the remote address to the requestee user and save it without waiting for it
                    user.addLastKnownRemoteAddress(req.connection.remoteAddress);
                    user.save();
                }

                user.setLocale(i18n.detectLocaleFromRequest(req));

                (new Promise(resolve => resolve()))
                    .then(result => new Promise((resolve, reject) => user.cacheGroupAndPermissions(resolve, reject)))
                    .then(result => req.login(user, ConfigServer.auth.session, next))
                    .catch(err => {
                        console.log(err);
                        res.send(internalErrorResponse());
                    });
            })(req, res, next);
        });
    }

    /**
     * The application it self is getting some configuration like
     * which view engine is gonna be used, where the view files are located, etc.
     *
     * @method initAppConfig
     */
    initAppConfig() {
        this.app.set('view engine', 'ejs');
        this.app.set('views', paths.views);

        this.app.use(Express.static(paths.static));
        this.app.use(BodyParser.urlencoded({ extended: false }));
        this.app.use(BodyParser.json());

        this.app.use(auth().initialize());
        this.app.use(Morgan('dev'));
    }

    /**
     * Initialize the API routes. You can define the API routes in
     * the api/ directory. Best practise is to create an API route for each
     * service. For example UserRoutes, CoasterRoutes, etc.
     * The routes should NOT implement ANY business logic, just USE the business logic there.
     * You can implement your business logic inside the services/ directory.
     *
     * @method initApiRoutes
     */
    initApiRoutes() {
        this.app.use('/api', Router.detectRoutes());
    }

    /**
     * Initializes the universal routes for server side rendering.
     * When we use frontend frameworks (react) and refreshing the website,
     * this router will match the request URL with the defined client routes and render it
     * on the server side. This is perfect for SEO (and for other reasons).
     *
     * @method initUniversalRoutes
     */
    initUniversalRoutes() {
        this.app.get('*', (req, res) => {
            RouterMatch({ routes: ClientRoutes, location: req.url }, (err, redirectLocation, renderProps) => {
                if (err) {
                    return res.status(500).send(err.message);
                }

                if (redirectLocation) {
                    return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
                }

                // Fixing the material ui issue "Server-side rendering warning with Express.js" #5973
                // https://github.com/callemall/material-ui/issues/5973
                global.navigator = {
                    userAgent: req.headers['user-agent'] || 'all'
                };

                let markup;
                if (renderProps) {
                    // Since we are using material ui, we need to wrap everything with MuiThemeProvider
                    markup = ReactRenderToString(
                        <MaterialThemeProvider muiTheme={MaterialTheme(ConfigClient.material.theme)}>
                            <RouterContext {...renderProps}/>
                        </MaterialThemeProvider>
                    );
                } else {
                    markup = ReactRenderToString(<ClientNotFoundPage/>);
                    res.status(404);
                }

                // Important: pass locale to the view, because we need the locale set properly in the html
                // attribute "lang" (<html lang="{locale}">). The client then can then determine the language
                return res.render('index', {
                    markup,
                    locale: i18n.getActiveLocale()
                });
            });
        });
    }

    /**
     * Start server (start listening)
     *
     * @method startServer
     */
    startServer() {
        this.app = new Express();
        this.server = new Server(this.app);

        this.server.listen(this.port, err => {
            if (err) {
                return console.error(err);
            }

            console.info(`Server running on http://localhost:${this.port} [${this.env}]`);
        });
    }
}

new ServerApplication();