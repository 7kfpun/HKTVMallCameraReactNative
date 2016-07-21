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
});

export default class MallItemCell extends Component {
  render() {
    const url = this.props.item.url;
    return (
      <View style={styles.container}>
        <TouchableHighlight onPress={() => Linking.openURL(`http://www.hktvmall.com/${url}?ref=HiRickyWong`)} underlayColor="#E0E0E0">
          <View style={styles.body}>
            {this.props.item.images && this.props.item.images.length > 0 && <Image
              style={styles.image}
              source={{ uri: this.props.item.images[0].url.replace('http', 'https') }}
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
