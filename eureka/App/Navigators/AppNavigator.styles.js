import {StyleSheet} from "react-native";
import {Fonts} from "../Theme";

export const styles = StyleSheet.create({
  headerIconWrap: {
    marginHorizontal: 15,
  },
  seetingIcon: {
    fontSize: 26,
  },
  headerMenuIcon: {
    fontSize: 30,
  },
  watchWrap: {
    position: 'relative',
  },
  redBadge: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: '#F86363',
    borderRadius: 14,
    right: 1,
    bottom: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  navRightIcon: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerTileWrap: {
    flex: 1,
    flexDirection: 'row',
  },
  headerTextStyle: {
    ...Fonts.fontBold,
    fontSize: 20,
    marginLeft: 5,
    // marginTop:2
  },
  syncImage: {
    height: 200,
    width: 200,
  },
});
