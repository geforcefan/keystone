"use strict";

import * as MaterialColors from 'material-ui/styles/colors';
import * as MaterialColorManipulator from 'material-ui/utils/colorManipulator';

const config = {
    material: {
        theme: {
            palette: {
                primary1Color: MaterialColors.lightBlue500,
                primary2Color: MaterialColors.lightBlue700,
                primary3Color: MaterialColors.grey400,
                accent1Color: MaterialColors.pinkA200,
                accent2Color: MaterialColors.grey100,
                accent3Color: MaterialColors.grey500,
                textColor: MaterialColors.darkBlack,
                secondaryTextColor: (0, MaterialColorManipulator.fade)(MaterialColors.darkBlack, 0.54),
                alternateTextColor: MaterialColors.white,
                canvasColor: MaterialColors.white,
                borderColor: MaterialColors.grey300,
                disabledColor: (0, MaterialColorManipulator.fade)(MaterialColors.darkBlack, 0.3),
                pickerHeaderColor: MaterialColors.cyan500,
                clockCircleColor: (0, MaterialColorManipulator.fade)(MaterialColors.darkBlack, 0.07),
                shadowColor: MaterialColors.fullBlack
            },
            appBar: {
                height: 50
            },
        }
    }
};

export default config;