import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

// 3rd parties
import Button from 'apsl-react-native-button';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
  buttonStyle: {
    borderColor: '#757575',
    backgroundColor: '#757575',
    borderRadius: 0,
    marginBottom: 2,
    height: 18,
    marginRight: 2,
    padding: 5,
    margin: 0,
  },
});

export default class LabelsCell extends Component {
  render() {
    return (
      <View style={styles.container}>
        {Array.isArray(this.props.elements) && this.props.elements.map((el, i) =>
          <Button
            key={i}
            style={styles.buttonStyle}
            textStyle={styles.buttonText}
            onPress={() => console.log()}
          >
            #{el.description}
          </Button>
        )}
      </View>
    );
  }
}

LabelsCell.propTypes = {
  elements: React.PropTypes.array,
};

LabelsCell.defaultProps = {
  elements: ['tag'],
};
