/**
 * DefaultLayout.js
 * This is the default layout for the whole application.
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

import { Row, Col, Container } from 'react-grid-system';

import ApplicationBar from '../components/ApplicationBar';

export default class DefaultLayout extends React.Component {
    render() {
        return (
            <div>
                <ApplicationBar />
                <Container>
                    <Row>
                        <Col xs={12} md={12}>
                            {this.props.children}
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}