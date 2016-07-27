import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    color: '#424242',
    fontSize: 16,
  },
});

export default class LogoCell extends Component {
  render() {
    return (
      <View style={styles.container}>
        {Array.isArray(this.props.elements) && this.props.elements.map((el, i) =>
          <Text
            key={i}
            style={styles.text}
            onPress={() => console.log()}
          >
            {el.description}
          </Text>
        )}
      </View>
    );
  }
}

LogoCell.propTypes = {
  elements: React.PropTypes.array,
};

LogoCell.defaultProps = {
  elements: ['tag'],
};
