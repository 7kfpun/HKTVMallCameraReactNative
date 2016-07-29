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
  option: {
    paddingTop: 10,
    paddingHorizontal: 10,
  },
});

export default class PchomeMallItemCell extends Component {
  onOpenUrl(url) {
    const modUrl = `http://24h.m.pchome.com.tw/prod/${url}?utm_source=MallCamByFrontn.com&utm_medium=app&utm_campaign=HiHungTzeJan`;
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
    GoogleAnalytics.trackEvent('user-action', 'open-pchome-item-url');
  }

  onShare(item) {
    Share.open({
      share_subject: item.name,
      share_text: item.describe.replace(/(?:\r\n|\r|\n|\s)/g, ''),
      share_URL: `http://24h.m.pchome.com.tw/prod/${item.Id}?utm_source=MallCamByFrontn.com&utm_medium=app&utm_campaign=HiHungTzeJan`,
      title: 'Share Link',
    }, (err) => {
      console.log(err);
    });
    GoogleAnalytics.trackEvent('user-action', 'share-pchome-item');
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
    GoogleAnalytics.trackEvent('user-action', 'save-pchome-item');
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight onPress={() => this.onOpenUrl(this.props.item.Id)} underlayColor="#E0E0E0">
          <View style={styles.body}>
            <Image
              style={styles.image}
              source={{ uri: `https://shopping.pchome.com.tw${this.props.item.picS}` }}
            />
            <View style={styles.details}>
              <Text style={styles.itemName}>
                {this.props.item.brand && `${this.props.item.brand} - `}{this.props.item.name}
              </Text>
              <Text style={styles.itemSummary}>
                {this.props.item.describe.replace(/(?:\r\n|\r|\n|\s)/g, '')}
              </Text>
              <Text style={styles.itemPrice}>
                {`${this.props.item.price} TWD`}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Icon name="share" style={styles.option} size={20} color="#757575" onPress={() => this.onShare(this.props.item)} />
                {/* <Icon name="bookmark-border" style={styles.option} size={20} color="#757575" onPress={() => this.onSave(this.props.item)} /> */}
              </View>
            </View>
          </View>
        </TouchableHighlight>
      </View>
    );
  }
}

PchomeMallItemCell.propTypes = {
  item: React.PropTypes.object,
  rowID: React.PropTypes.string,
};

PchomeMallItemCell.defaultProps = {
  item: {},
  rowID: '0',
};
