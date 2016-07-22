import React, { Component } from 'react';
import {
  ListView,
  StyleSheet,
  View,
} from 'react-native';

import firebase from 'firebase';

// 3rd party libraries
import DeviceInfo from 'react-native-device-info';
import Spinner from 'react-native-spinkit';

// Elements
import MallItemCell from './mall-item-cell';

const uniqueID = DeviceInfo.getUniqueID();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  spinner: {
    margin: 50,
    alignItems: 'center',
  },
});

export default class LogosCell extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      loading: true,
    };
  }

  componentDidMount() {
    const query = encodeURIComponent(this.props.query);
    const url = `https://www.hktvmall.com/hktv/zh/ajax/search_products?query=%22${query}%22%3Arelevance&pageSize=60`;
    console.log('encodeURIComponent', url);
    const that = this;
    fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      if (json.products && json.products.length > 0) {
        that.setState(Object.assign({}, json, {
          dataSource: that.state.dataSource.cloneWithRows(json.products),
          key: Math.random(),
          loading: false,
        }));

        try {
          firebase.database().ref(`users/${uniqueID}/${that.props.filename}/hktv`.replace('.jpg', '')).set(json.products);
        } catch (err) {
          console.warn(err);
        }
      }
    })
    .catch((error) => {
      console.warn(error);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.loading && <View style={styles.spinner}>
          <Spinner isVisible={this.state.isVisible} size={40} type={'Pulse'} color={'#424242'} />
        </View>}
        <ListView
          key={this.state.key}
          dataSource={this.state.dataSource}
          renderRow={(rowData, sectionID, rowID) => <MallItemCell item={rowData} rowID={rowID} />}
        />
      </View>
    );
  }
}

LogosCell.propTypes = {
  elements: React.PropTypes.array,
  query: React.PropTypes.string,
  filename: React.PropTypes.string,
};

LogosCell.defaultProps = {
  elements: ['tag'],
  query: 'hktv',
  filename: 'hktv',
};
