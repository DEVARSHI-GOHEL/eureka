import React from 'react';
import {Dimensions } from "react-native";
import {Circle, Rect, Text, Image, G} from 'react-native-svg';
import * as Properties from '../VizConstants/GraphProperties'; 
import {closeTooltipIcon} from '../AppIcons/VizIcons';

const TOOLTIP_CONFIG = {
    show: false,
    x: 0,
    y: 0,
    width: 120,
    height: 60,
    rx: "5",
    ry: "5",
    rectStroke : "#a5a5a5",
    rectFill: "#ffff",
    rectStrokeWidth: 1,
    cx: 0,
    cy: 0,
    radius: 7,
    radiusInner: 2,
    stroke: Properties.SELECTOR_AND_BLUE_SHADE_COLOR,
    strokeWidth: 2,
    fill: "#ffff",
    fillInner : Properties.SELECTOR_AND_BLUE_SHADE_COLOR,
    textPaddingVertical: 10,
    textPaddingHorizontal: 20,
    spacingBetweenLeftAndRightStepText: 5,
    leftStepTextX: 0,
    leftStepTextY: 0,
    leftStepTextFill: "black",
    leftStepTextFontSize: "16px",
    leftStepTextFontWeight: "bold",
    rightStepTextX: 0,
    rightStepTextY: 0,
    rightStepTextFill: "black",
    rightStepTextFontSize: "13px",
    rightStepTextFontWeight: "normal",
    dateTextX: 0,
    dateTextY: 0,
    dateTextFill: "#000",
    dateTextFontSize: "13px",
    dateTextFontWeight: "normal",
    iconX: 0,
    iconY: 0,
    iconHeight: "10px",
    iconWidth: "8px",
    icon: "./close.png",
    iconPaddingHorizontal: 16,
    iconPaddingVertical: 1,
    iconCursor: "pointer",

    leftTextVal: "--",
    rightTextVal: "--",
    bottomTextVal: "--",
};

export default class Tooltip extends React.Component {

    constructor(props) {
        super(props);
        TOOLTIP_CONFIG.width = this.props.extended ? 150 : 120;
        this.state = {...TOOLTIP_CONFIG};
    }

    getNextState = (data) => {

        let isCompact = this.props.compact;
        let textSpace = this.props.textSpace;

        let SPACING_BETWEEN_CIRCLE_AND_RECT_TOOLTIP = 5;
        let VERTICAL_OFFSET_TO_ADJUST_LEFT_AND_RIGHT_STEP_TEXT = 40;

        let xVal = data.x;
        let yVal = data.y;

        let cx = xVal + ((data.width*1) / 2);
        let cy = yVal;
        let x = cx - (TOOLTIP_CONFIG.width / 2);
        let y = cy - (TOOLTIP_CONFIG.height + TOOLTIP_CONFIG.radius + SPACING_BETWEEN_CIRCLE_AND_RECT_TOOLTIP);

        let leftStepTextX = x + TOOLTIP_CONFIG.textPaddingVertical;
        let leftStepTextY = y + TOOLTIP_CONFIG.textPaddingHorizontal;
        //let stepVal = data.y_tooltip_text;
        // let stepVal = Y_SCALE.invert(yVal);
        let leftTextVal = data.tooltipMeta.leftTextVal;

        let rightStepTextX = leftStepTextX + TOOLTIP_CONFIG.spacingBetweenLeftAndRightStepText + VERTICAL_OFFSET_TO_ADJUST_LEFT_AND_RIGHT_STEP_TEXT - (isCompact ? 10 : 0) + (textSpace?15:0);
        let rightStepTextY = y + TOOLTIP_CONFIG.textPaddingHorizontal;
        let rightTextVal = data.tooltipMeta.rightTextVal;

        let dateTextX = x + TOOLTIP_CONFIG.textPaddingVertical;
        let dateTextY = y + TOOLTIP_CONFIG.textPaddingHorizontal + TOOLTIP_CONFIG.textPaddingHorizontal;
        let bottomTextVal = data.tooltipMeta.bottomTextVal;

        let iconX = x + TOOLTIP_CONFIG.width - TOOLTIP_CONFIG.iconPaddingHorizontal;
        let iconY = y + TOOLTIP_CONFIG.iconPaddingVertical;

        return {
            cx: cx,
            cy: cy,
            x: x,
            y: y,
            leftStepTextX: leftStepTextX,
            leftStepTextY: leftStepTextY,
            leftTextVal: leftTextVal,
            rightStepTextX: rightStepTextX,
            rightStepTextY: rightStepTextY,
            rightTextVal: rightTextVal,
            dateTextX: dateTextX,
            dateTextY: dateTextY,
            bottomTextVal: bottomTextVal,
            iconX: iconX,
            iconY: iconY
        };
    }

    setPosition = (attr) => {

        let nextState = this.getNextState(attr);
        this.setState({...this.state, ...nextState, show : true, });
    }

    closeTooltip = () => {
        this.setState({...this.state, show : false});
    }

    render () {
        let isHidden = this.state.show ? "" : "none";

        let offset = 0;

        if(this.state.x*1 > (Properties.GRAPH_WIDTH - 2*Properties.PADDING_HORIZONTAL)) {
            offset = -1*(this.state.width*1)/3;
        }
        else if(this.state.x*1  < 0) {
            offset = (this.state.width*1)/3;
        }

        let jsx = (
          <G style={{display:isHidden}}>

                <Circle cx={this.state.cx} cy={this.state.cy} r={this.state.radius} stroke={this.state.stroke} fill={this.state.fill} 
                                strokeWidth={this.state.strokeWidth} />
                <Circle cx={this.state.cx} cy={this.state.cy} r={this.state.radiusInner} stroke={this.state.stroke} fill={this.state.fillInner} 
                                strokeWidth={this.state.strokeWidth} />



                <Rect x={this.state.x*1 + offset} y={this.state.y} width={this.state.width} height={this.state.height} 
                            rx={this.state.rx} ry={this.state.ry} 
                            stroke={this.state.rectStroke} fill={this.state.rectFill} strokeWidth={this.state.rectStrokeWidth} />

                <Text fill={this.state.leftStepTextFill} x = {this.state.leftStepTextX*1 + offset} y={this.state.leftStepTextY} 
                    fontSize={this.state.leftStepTextFontSize} fontWeight={this.state.leftStepTextFontWeight} >{this.state.leftTextVal}</Text>

                <Text fill={this.state.rightStepTextFill} x = {this.state.rightStepTextX*1 + offset} y={this.state.rightStepTextY} 
                    fontSize={this.state.rightStepTextFontSize} fontWeight={this.state.rightStepTextFontWeight} >{this.state.rightTextVal}</Text>

                <Text fill={this.state.dateTextFill} x = {this.state.dateTextX*1 + offset} y={this.state.dateTextY} 
                    fontSize={this.state.dateTextFontSize} fontWeight={this.state.dateTextFontWeight} >{this.state.bottomTextVal}</Text>

                <Image href = {closeTooltipIcon} x={this.state.iconX*1 + offset} y={this.state.iconY} width={14} height={14} onPress={()=>{this.closeTooltip()}}/>
          </G>  
        );

        return jsx;
    }
}