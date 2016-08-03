import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

// 3rd party libraries
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SafariView from 'react-native-safari-view';
import Share from 'react-native-share';
import store from 'react-native-simple-store';
import Toast from 'react-native-root-toast';

import { locale } from './../locale';
const strings = locale.zh_Hant;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  body: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    borderBottomColor: '#CCCCCC',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  image: {
    width: Dimensions.get('window').width / 4,
    height: Dimensions.get('window').width / 4,
    resizeMode: 'cover',
  },
  details: {
    flex: 1,
    flexDirection: 'column',
  },
  itemName: {
    paddingLeft: 10,
    marginBottom: 5,
    color: '#424242',
    fontSize: 15,
    fontWeight: '500',
  },
  itemSummary: {
    paddingLeft: 10,
    color: '#424242',
    fontSize: 15,
  },
  itemPrice: {
    marginTop: 5,
    paddingLeft: 10,
    color: '#424242',
    fontSize: 15,
  },
  optionBlock: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  option: {
    paddingTop: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    color: '#757575',
    fontSize: 12,
  },
});

export default class GoogleMallItemCell extends Component {
  onOpenUrl(url) {
    try {
      SafariView.isAvailable()
        .then(SafariView.show({
          url,
        }))
        .catch(err => {
          console.error('Cannot open safari', err);
        });
    } catch (err) {
      Linking.openURL(url)
        .catch(err1 => {
          console.error('Cannot open url', err1);
        });
    }
    GoogleAnalytics.trackEvent('user-action', 'open-google-item-url');
  }

  onShare(item) {
    Share.open({
      share_subject: item.title,
      share_text: item.snippet,
      share_URL: item.link,
      title: 'Share Link',
    }, (err) => {
      console.log(err);
    });
    GoogleAnalytics.trackEvent('user-action', 'share-google-item');
  }

  onSave(item) {
    store.get('Product').then(savedProduct => {
      console.log('savedProduct', savedProduct);
      let product = savedProduct;
      if (!product) {
        product = [];
      }
      product.push(item);
      store.save('Product', product);
      Toast.show('Saved', { duration: Toast.durations.SHORT });
    });
    GoogleAnalytics.trackEvent('user-action', 'save-item');
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight onPress={() => this.onOpenUrl(this.props.item.link)} underlayColor="#E0E0E0">
          <View style={styles.body}>
            {this.props.item.pagemap && this.props.item.pagemap.cse_thumbnail && <Image
              style={styles.image}
              source={{ uri: this.props.item.pagemap && this.props.item.pagemap.cse_thumbnail && this.props.item.pagemap.cse_thumbnail[0].src }}
            />}
            {this.props.item.pagemap && !this.props.item.pagemap.cse_thumbnail && <Image
              style={styles.image}
              source={{ uri: this.props.item.pagemap && this.props.item.pagemap.cse_image && this.props.item.pagemap.cse_image[0].src }}
            />}
            <View style={styles.details}>
              <Text style={styles.itemName}>
                {this.props.item.title}
              </Text>
              <Text style={styles.itemSummary}>
                {this.props.item.snippet}
              </Text>

              <View style={styles.optionBlock}>
                <TouchableHighlight onPress={() => this.onShare(this.props.item)} underlayColor="white">
                  <View style={styles.option}>
                    <Icon name="share" size={20} color="#757575" />
                    <Text style={styles.optionText}>{strings.share}</Text>
                  </View>
                </TouchableHighlight>
                {/* <TouchableHighlight onPress={() => this.onSave(this.props.item)} underlayColor="white">
                  <View style={styles.option}>
                    <Icon name="bookmark-border" size={20} color="#757575" />
                    <Text style={styles.optionText}>{strings.save}</Text>
                  </View>
                </TouchableHighlight> */}
              </View>
            </View>
          </View>
        </TouchableHighlight>
      </View>
    );
  }
}

GoogleMallItemCell.propTypes = {
  item: React.PropTypes.object,
  rowID: React.PropTypes.string,
};

GoogleMallItemCell.defaultProps = {
  item: {},
  rowID: '0',
};
