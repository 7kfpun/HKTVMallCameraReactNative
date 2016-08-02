import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

// 3rd party libraries
import { Actions } from 'react-native-router-flux';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Components
import MallCell from './../components/mall-cell';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  back: {
    position: 'absolute',
    left: 10,
    top: 25,
  },
  results: {
    padding: 10,
  },
});

export default class BarcodeResultView extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    console.log('componentDidMount', this.props.data);
  }

  render() {
    GoogleAnalytics.trackScreenView('Result');

    return (
      <View style={styles.container}>
        <ScrollView >
          <View style={styles.results}>
            <MallCell query={this.props.data} />
          </View>
        </ScrollView>
        <Icon name="keyboard-arrow-left" style={styles.back} size={30} color="#616161" onPress={() => Actions.pop()} />
      </View>
    );
  }
}

BarcodeResultView.propTypes = {
  data: React.PropTypes.string,
};

BarcodeResultView.defaultProps = {
  data: '',
};
