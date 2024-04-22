/**
 * This file contains metric values that are global to the application.
 */

export const five = 5; //tiny
export const ten = five * 2; // 10 / small
export const fifteen = five * 3; // 15 // normal
export const twenty = five * 4; // 20// medium
export const thirty = fifteen * 2; // 30 //large

export default {
  tinyBottomMargin: {
    marginBottom: five,
  },
  smallBottomMargin: {
    marginBottom: ten
  },
  bottomMargin: {
    marginBottom: fifteen
  },
  mediumBottomMargin: {
    marginBottom: twenty
  },
  largeBottomMargin: {
    marginBottom: thirty
  },

  tinyLeftMargin: {
    marginLeft: five
  },
  smallLeftMargin: {
    marginLeft: ten
  },
  leftMargin:{
    marginLeft:fifteen
  },
  largeLeftMargin:{
    marginLeft:thirty
  },

  tinyrightMargin: {
    marginLeft: five
  },
  smallRightMargin: {
    marginRight: ten
  },
  rightMargin:{
    marginRight:fifteen
  },

  tinyTopMargin: {
    marginTop: five
  },
  smallTopMargin: {
    marginTop: ten
  },
  topMargin:{
    marginTop:twenty
  },

  minusTinyTopMargin:{
    marginTop:-five
  },
  minusTopMargin:{
    marginTop:-fifteen
  },

  tinyVerticalMargin: {
    marginVertical: five
  },
  smallVerticalMargin: {
    marginVertical: ten
  },
  verticalMargin: {
    marginVertical: fifteen
  },
  mediumVerticalMargin: {
    marginVertical: twenty
  },

  tinyHorizontalMargin: {
    marginHorizontal: five
  },
  smallHorizontalMargin: {
    marginHorizontal: ten
  },
  horizontalMargin: {
    marginHorizontal: fifteen
  },
  mediumHorizontalMargin: {
    marginHorizontal: twenty
  },

  tinyLeftPadding: {
    paddingLeft: five
  },
  smallLeftPadding: {
    paddingLeft: ten
  },
  leftPadding:{
    paddingLeft:fifteen
  },
  largeLeftPadding:{
    paddingLeft:thirty
  },
  smallRightPadding: {
    paddingRight: ten
  },
  rightPadding:{
    paddingRight:fifteen
  },

  tinyHorizontalPadding: {
    paddingHorizontal: five
  },
  smallHorizontalPadding: {
    paddingHorizontal: ten
  },
  horizontalPadding: {
    paddingHorizontal: fifteen
  },
  mediumHorizontalPadding: {
    paddingHorizontal: twenty
  },

  tinyVerticalPadding: {
    paddingVertical: five
  },
  smallVerticalPadding: {
    paddingVertical: ten
  },
  verticalPadding: {
    paddingVertical: fifteen
  },
  mediumVerticalPadding: {
    paddingVertical: twenty
  },

  alertPadding:{
    paddingLeft:9,
    paddingTop:13
  },

  spaceRemover:{
    marginLeft:0,
    marginRight:0,
    paddingRight:0,
    paddingLeft:0,
  },

  percentWidth:{
    width:'100%'
  },
  percentHeight:{
    height:'100%'
  },
  fixedHeight:{
    height:100
  }
};
