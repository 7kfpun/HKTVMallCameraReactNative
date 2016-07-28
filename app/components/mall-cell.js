import React, { Component } from 'react';
import {
  Dimensions,
  ListView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import firebase from 'firebase';

// 3rd party libraries
import Spinner from 'react-native-spinkit';

// Elements
import MallItemCell from './mall-item-cell';
import ParknshopMallItemCell from './parknshop-mall-item-cell';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  spinner: {
    margin: 50,
    alignItems: 'center',
  },
  noResults: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width - 20,
  },
});

export default class LogosCell extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      loading: true,
      products: [],
    };
  }

  componentDidMount() {
    if (this.props.shop === 'HKTVMALL') {
      this.searchHktvMall();
    } else if (this.props.shop === 'PARKNSHOP') {
      this.searchParknshop();
    }
  }

  searchParknshop() {
    const query = encodeURIComponent(this.props.query.replace(/\s/g, '+'));
    const resultsForPage = 25;
    console.log('encodeURIComponentquery', query);
    // http://www.parknshop.com/search?sort=mostRelevant&q=${query}%3AmostRelevant&resultsForPage=30
    const url = `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.parknshop.com%2Fsearch%3Fsort%3DmostRelevant%26q%3D${query}%3AmostRelevant%26resultsForPage%3D${resultsForPage}%26lang%3Dzt%22%20and%20xpath%3D%22%2F%2Fdiv%5B%40class%3D%5C'enjoyProduct%5C'%5D%2F%2Fdiv%5B%40class%3D%5C'productCol%5C'%5D%22&format=json&diagnostics=true&callback=`;    // eslint-disable-line max-len
    console.log('encodeURIComponent', url);
    const that = this;
    fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      if (json.query && json.query.results && json.query.count > 0) {
        that.setState(Object.assign({}, json, {
          dataSource: that.state.dataSource.cloneWithRows(json.query.count === 1 ? [json.query.results.div] : json.query.results.div),
          key: Math.random(),
          hasResult: true,
        }));

        try {
          if (that.props.filename) {
            firebase.database().ref(`app/parknshop/${that.props.filename}`.replace('.jpg', '')).set(json.query.results.div);
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        that.setState({ hasResult: false });
      }

      that.setState({ loading: false });
    })
    .catch((error) => {
      console.warn(error);
    });
  }

  searchHktvMall() {
    const query = encodeURIComponent(this.props.query);
    const url = `https://www.hktvmall.com/hktv/zh/ajax/search_products?query=%22${query}%22%3Arelevance&pageSize=30`;
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
          hasResult: true,
        }));

        try {
          if (that.props.filename) {
            firebase.database().ref(`app/hktv/${that.props.filename}`.replace('.jpg', '')).set(json.products);
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        that.setState({ hasResult: false });
      }

      that.setState({ loading: false });
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
        {!this.state.loading && !this.state.hasResult && <View style={styles.noResults}>
          <Text>No results</Text>
        </View>}
        {!this.state.loading && this.state.hasResult && <ListView
          key={this.state.key}
          dataSource={this.state.dataSource}
          renderRow={(rowData, sectionID, rowID) => {
            if (this.props.shop === 'HKTVMALL') {
              return <MallItemCell item={rowData} rowID={rowID} />;
            }

            return <ParknshopMallItemCell item={rowData} rowID={rowID} />;
          }}
        />}
      </View>
    );
  }
}

LogosCell.propTypes = {
  elements: React.PropTypes.array,
  shop: React.PropTypes.string,
  query: React.PropTypes.string,
  filename: React.PropTypes.string,
};

LogosCell.defaultProps = {
  elements: ['tag'],
  shop: 'hktv',
};
