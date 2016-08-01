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

export default class BooksMallItemCell extends Component {
  onOpenUrl(url) {
    const modUrl = `${url}?utm_source=MallCamByFrontn.com&utm_medium=app&utm_campaign=HiBooks`;
    console.log(modUrl);
    try {
      SafariView.isAvailable()
        .then(SafariView.show({
          url: modUrl,
        }))
        .catch(err => {
          console.error('Cannot open safari', err);
        });
    } catch (err) {
      Linking.openURL(modUrl)
        .catch(err1 => {
          console.error('Cannot open url', err1);
        });
    }
    GoogleAnalytics.trackEvent('user-action', 'open-parknshop-item-url');
  }

  onShare(item) {
    Share.open({
      share_subject: item.h3.a.title,
      share_text: item.p && item.p.content.replace(/(?:\r\n|\r|\n)/g, ' '),
      share_URL: `${item.h3.a.href}?utm_source=MallCamByFrontn.com&utm_medium=app&utm_campaign=HiBooks`,
      title: 'Share Link',
    }, (err) => {
      console.log(err);
    });
    GoogleAnalytics.trackEvent('user-action', 'share-parknshop-item');
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
        <TouchableHighlight onPress={() => this.onOpenUrl(this.props.item.h3.a.href)} underlayColor="#E0E0E0">
          <View style={styles.body}>
            <Image
              style={styles.image}
              source={{ uri: this.props.item.a && Array.isArray(this.props.item.a) ?
                                                  this.props.item.a[0].img && this.props.item.a[0].img['data-original']
                                                  :
                                                  this.props.item.a.img && this.props.item.a.img['data-original'],
                                                }}
            />
            <View style={styles.details}>
              <Text style={styles.itemName}>
                {Array.isArray(this.props.item.a) ? this.props.item.a[this.props.item.a.length - 1].title : this.props.item.a.title} - {this.props.item.h3.a.title}
              </Text>
              <Text style={styles.itemSummary}>
                {this.props.item.p && this.props.item.p.content.replace(/(?:\r\n|\r|\n)/g, ' ')}
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

BooksMallItemCell.propTypes = {
  item: React.PropTypes.object,
  rowID: React.PropTypes.string,
};

BooksMallItemCell.defaultProps = {
  item: {},
  rowID: '0',
};
