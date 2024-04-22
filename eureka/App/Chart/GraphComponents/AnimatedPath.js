import React, {Component} from 'react';
import {Animated} from 'react-native';
import {Line, PathProps} from 'react-native-svg';

class AnimatedPath extends Component {
  pathRef = React.createRef();

  setNativeProps = (nativeProps) => {
    if (this.pathRef.current != null) {
      this.pathRef.current.setNativeProps(nativeProps);
    }
  };

  shouldComponentUpdate(nextProps) {
    const {fill, stroke, strokeWidth} = this.props;
    if (
      nextProps.fill !== fill ||
      nextProps.stroke !== stroke ||
      nextProps.strokeWidth !== strokeWidth
    ) {
      return true;
    }

    return false;
  }

  render() {
    return <Line ref={this.pathRef} {...this.props} />;
  }
}

export default Animated.createAnimatedComponent(AnimatedPath);
