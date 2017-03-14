import React from 'react';

import AppBar from 'material-ui/AppBar';

import { tr }  from '../../shared/helper/i18n';

export default class ApplicationBar extends React.Component {
    render() {
        return (
            <AppBar title={tr("client.header.title")} />
        );
    }
}