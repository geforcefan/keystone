/**
 * routes.js
 * Definition of all routes. Don´t worry about server side rendering,
 * reacts route matcher will do the magic. For more explanation
 * look in server/server.js
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

"use strict";

import React from 'react'
import { Route, IndexRoute } from 'react-router'

import DefaultLayout from './layout/DefaultLayout';

import IndexPage from './pages/IndexPage';
import NotFoundPage from './pages/NotFoundPage';

const routes = (
    <Route path="/" component={DefaultLayout}>
        <IndexRoute component={IndexPage}/>
        <Route path="*" component={NotFoundPage}/>
    </Route>
);

export default routes;