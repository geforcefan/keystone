/**
 * IndexPage.js
 * This is the index page, the portal, whatever you want to call it
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

import React from 'react';
import { Card, CardTitle } from 'material-ui/Card';

import { tr } from '../../shared/helper/i18n';


export default class IndexPage extends React.Component {
    render() {
        return (
            <Card className="container">
                <CardTitle title={tr("client.header.title")}  subtitle={tr("client.header.title")} />
            </Card>
        );
    }
}