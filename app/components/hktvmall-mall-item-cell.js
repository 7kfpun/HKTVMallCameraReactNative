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

import striptags from 'striptags';

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

export default class HktvmallMallItemCell extends Component {
  onOpenUrl(url) {
    // const hktvUrl = `https://www.hktvmall.com/${url}?utm_source=MallCamByFrontn.com&utm_medium=app&utm_term=MayIHaveAShortMeetingWithYou&utm_content=hey@frontn.com&utm_campaign=HiRickyWong&ref=MayIHaveAShortMeetingWithYou`;  // eslint-disable-line max-len
    const hktvUrl = `https://www.hktvmall.com/${url}?utm_source=MallCamByFrontn.com&utm_medium=app&utm_campaign=HiRickyWong`;
    try {
      SafariView.isAvailable()
        .then(SafariView.show({
          url: hktvUrl,
        }))
        .catch(err => {
          console.error('Cannot open safari', err);
        });
    } catch (err) {
      Linking.openURL(hktvUrl)
        .catch(err1 => {
          console.error('Cannot open url', err1);
        });
    }
    GoogleAnalytics.trackEvent('user-action', 'open-hktvmall-item-url');
  }

  onShare(item) {
    Share.open({
      share_subject: item.itemName,
      share_text: item.summary,
      share_URL: `https://www.hktvmall.com/${item.url}?utm_source=MallCamByFrontn.com&utm_medium=app&utm_campaign=HiRickyWong`,
      title: 'Share Link',
    }, (err) => {
      console.log(err);
    });
    GoogleAnalytics.trackEvent('user-action', 'share-hktvmall-item');
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
        <TouchableHighlight onPress={() => this.onOpenUrl(this.props.item.url)} underlayColor="#E0E0E0">
          <View style={styles.body}>
            {this.props.item.images && this.props.item.images.length > 0 && <Image
              style={styles.image}
              source={{ uri: this.props.item.images[0].url.startsWith('http') ?
                          this.props.item.images[0].url.replace('http', 'https')
                          :
                          `https://www.hktvmall.com${this.props.item.images[0].url}`,
                        }}
            />}
            <View style={styles.details}>
              <Text style={styles.itemName}>
                {this.props.item.brandName} - {this.props.item.name}
              </Text>
              <Text style={styles.itemSummary}>
                {striptags(this.props.item.summary)}
              </Text>
              <Text style={styles.itemPrice}>
                {this.props.item.price && this.props.item.price.formattedValue}
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

HktvmallMallItemCell.propTypes = {
  item: React.PropTypes.object,
  rowID: React.PropTypes.string,
};

HktvmallMallItemCell.defaultProps = {
  item: {},
  rowID: '0',
};
