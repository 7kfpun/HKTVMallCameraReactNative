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

export default class MallItemCell extends Component {
  onOpenUrl(url) {
    const parknshopUrl = `https://www.parknshop.com${url}?utm_source=MallCamByFrontn.com&utm_medium=app&utm_campaign=HiLiKaShing`;
    console.log(parknshopUrl);
    try {
      SafariView.isAvailable()
        .then(SafariView.show({
          url: parknshopUrl,
        }))
        .catch(err => {
          console.error('Cannot open safari', err);
        });
    } catch (err) {
      Linking.openURL(parknshopUrl)
        .catch(err1 => {
          console.error('Cannot open url', err1);
        });
    }
    GoogleAnalytics.trackEvent('user-action', 'open-parknshop-item-url');
  }

  onShare(item) {
    Share.open({
      share_subject: item.dl[0].dt.span[0].content.replace(/(?:\r\n|\r|\n|\s)/g, ''),
      share_text: this.props.item.dl[0].dt.a.content && this.props.item.dl[0].dt.a.content.replace(/(?:\r\n|\r|\n|\s)/g, ''),
      share_URL: `https://www.parknshop.com${item.dl[0].dd.a.img.src}?utm_source=MallCamByFrontn.com&utm_medium=app&utm_campaign=HiLiKaShing`,
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
        <TouchableHighlight onPress={() => this.onOpenUrl(this.props.item.dl[0].dd.a.href)} underlayColor="#E0E0E0">
          <View style={styles.body}>
            <Image
              style={styles.image}
              source={{ uri: `https://www.parknshop.com/${this.props.item.dl[0].dd.a.img.src}` }}
            />
            <View style={styles.details}>
              <Text style={styles.itemName}>
                {this.props.item.dl[0].dt.strong.replace(/(?:\r\n|\r|\n|\s)/g, '')} - {this.props.item.dl[0].dt.span[0].content.replace(/(?:\r\n|\r|\n|\s)/g, '')}
              </Text>
              <Text style={styles.itemSummary}>
                {this.props.item.dl[0].dt.a.content && this.props.item.dl[0].dt.a.content.replace(/(?:\r\n|\r|\n|\s)/g, '')}
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

MallItemCell.propTypes = {
  item: React.PropTypes.object,
  rowID: React.PropTypes.string,
};

MallItemCell.defaultProps = {
  item: {},
  rowID: '0',
};
