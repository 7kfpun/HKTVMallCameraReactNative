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
    const encodedQuery = encodeURIComponent(query.substring(0, 1000));
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
            onPress={() => this.searchGoogle(el.description)}
          >
            <Icon name="search" size={22} color="#616161" onPress={() => console.log()} />
            {el.description.length > 18 ? `${el.description.substring(0, 18 - 3).replace('\n', ' ')}...` : el.description.replace('\n', ' ')}
          </Button>
        )}
      </View>
    );

    // return (
    //   <View>
    //     {Array.isArray(this.props.elements) && this.props.elements.splice(0, 1).map((el, i) =>
    //       <View key={i} style={styles.container}>
    //         <Icon style={styles.icon} name="search" size={30} color="#616161" onPress={() => console.log()} />
    //         <Text
    //           key={i}
    //           style={styles.text}
    //           onPress={() => this.copyText(el.description)}
    //         >
    //           {el.description}
    //         </Text>
    //       </View>
    //     )}
    //   </View>
    // );
  }
}

TextCell.propTypes = {
  elements: React.PropTypes.array,
};

TextCell.defaultProps = {
  elements: ['tag'],
};
