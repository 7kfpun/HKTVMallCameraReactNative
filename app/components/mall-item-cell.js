import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  TouchableHighlight,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import striptags from 'striptags';

// 3rd party libraries
import Icon from 'react-native-vector-icons/MaterialIcons';
import SafariView from 'react-native-safari-view';
import Share from 'react-native-share';

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
    marginTop: 10,
    paddingLeft: 10,
    color: '#424242',
    fontSize: 15,
  },
  option: {
    marginHorizontal: 5,
  },
});

export default class MallItemCell extends Component {
  onOpenUrl(url) {
    // const hktvUrl = `http://www.hktvmall.com/${url}?utm_source=MallCam&utm_medium=app&utm_term=MayIHaveAShortMeetingWithYou&utm_content=hey@frontn.com&utm_campaign=HiRickyWong&ref=MayIHaveAShortMeetingWithYou`;  // eslint-disable-line max-len
    const hktvUrl = `http://www.hktvmall.com/${url}?utm_source=MallCam&utm_medium=app&utm_campaign=HiRickyWong`;
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
  }

  onShare() {
    Share.open({
      share_subject: this.props.item.itemName,
      share_text: this.props.item.summary,
      share_URL: this.props.item.url,
      title: 'Share Link',
    }, (err) => {
      console.log(err);
    });
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
                {this.props.item.name}
              </Text>
              <Text style={styles.itemSummary}>
                {striptags(this.props.item.summary)}
              </Text>
              <Text style={styles.itemPrice}>
                {this.props.item.price && this.props.item.price.formattedValue}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Icon name="share" style={styles.option} size={18} color="#757575" onPress={() => this.onShare()} />
                <Icon name="save" style={styles.option} size={18} color="#757575" onPress={() => this.onSave()} />
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
