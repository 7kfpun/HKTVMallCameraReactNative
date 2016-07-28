import React, { Component } from 'react';
import {
  Linking,
  StyleSheet,
  View,
} from 'react-native';

// 3rd party libraries
import Button from 'apsl-react-native-button';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SafariView from 'react-native-safari-view';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  buttonText: {
    color: '#424242',
    fontSize: 16,
  },
  buttonStyle: {
    borderColor: '#F5F5F5',
    borderRadius: 0,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default class TextCell extends Component {
  // copyText(text) {
  //   Alert.alert('Copy text?', null, [
  //     { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
  //     { text: 'Yes', onPress: () => Clipboard.setString(text) },
  //   ]);
  // }

  searchGoogle(query) {
    const encodedQuery = encodeURIComponent(query);
    const googleUrl = `https://www.google.com/search?q=${encodedQuery}&utm_source=MallCamByFrontn.com&utm_medium=app`;
    try {
      SafariView.isAvailable()
        .then(SafariView.show({
          url: googleUrl,
        }))
        .catch(err => {
          console.error('Cannot open safari', err);
        });
    } catch (err) {
      Linking.openURL(googleUrl)
        .catch(err1 => {
          console.error('Cannot open url', err1);
        });
    }
    GoogleAnalytics.trackEvent('user-action', 'search-google');
  }

  render() {
    const firstElement = [this.props.elements[0]];
    return (
      <View>
        {Array.isArray(this.props.elements) && firstElement.map((el, i) =>
          <Button
            key={i}
            style={styles.buttonStyle}
            textStyle={styles.buttonText}
            onPress={() => this.searchGoogle(el.description.substring(0, 500).replace(/(?:\r\n|\r|\n)/g, ' '))}
          >
            <Icon name="search" size={22} color="#616161" onPress={() => console.log()} />
            {el.description.length > 18 ? `${el.description.substring(0, 18 - 3).replace(/(?:\r\n|\r|\n)/g, ' ')}...` : el.description.replace(/(?:\r\n|\r|\n)/g, ' ')}
          </Button>
        )}
      </View>
    );
  }
}

TextCell.propTypes = {
  elements: React.PropTypes.array,
};

TextCell.defaultProps = {
  elements: ['tag'],
};
