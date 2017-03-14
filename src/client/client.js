/**
 * client.js
 * Entry point for the client application.
 *
 *
 * @license GPL-3.0
 * @version 1.0
 * @author  Ercan "geforcefan" Akyürek, https://github.com/geforcefan/
 * @updated 2017-03-09
 * @link    https://github.com/geforcefan/keystone/
 *
 *
 */

import React from 'react';
import ReactDom from 'react-dom';
import { browserHistory, Router } from 'react-router';

import injectTapEventPlugin from 'react-tap-event-plugin'

import MaterialTheme from 'material-ui/styles/getMuiTheme';
import MaterialThemeProvider from 'material-ui/styles/MuiThemeProvider';

import routes from './routes';

import ConfigClient from './../../config/client';
import i18n from '../shared/helper/i18n';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

// Set the locale provided in the HTML attribute "lang"
i18n.detectAndSetLocaleFromDocument();

ReactDom.render((
        <MaterialThemeProvider muiTheme={MaterialTheme(ConfigClient.material.theme)}>
                <Router history={browserHistory} routes={routes} onUpdate={() => window.scrollTo(0, 0)}/>
        </MaterialThemeProvider>), document.getElementById('main'));