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
import HktvmallMallItemCell from './hktvmall-mall-item-cell';
import ParknshopMallItemCell from './parknshop-mall-item-cell';
import PchomeMallItemCell from './pchome-mall-item-cell';
import BooksMallItemCell from './books-mall-item-cell';

import GoogleMallItemCell from './google-mall-item-cell';

import { locale } from './../locale';
const strings = locale.zh_Hant;

import { config } from './../config';
const googleSearch = config.googleSearch;

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

export default class MallCell extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      loading: true,
      products: [],
    };
  }

  componentDidMount() {
    this.selectMall();
  }

  selectMall() {
    if (this.props.shop === 'HKTVMALL') {
      this.searchHktvMall();
    } else if (this.props.shop === 'PARKNSHOP') {
      this.searchParknshop();
    } else if (this.props.shop === 'PCHOME') {
      this.searchPchome();
    } else if (this.props.shop === 'BOOKS') {
      this.searchBooks();
    } else if (this.props.shop === 'GOOGLESEARCH') {
      this.searchGoogleSearch(this.props.country);
    } else {
      this.searchHktvMall();
    }
  }

  searchHktvMall() {
    const query = encodeURIComponent(this.props.query);
    const resultsForPage = 25;
    const url = `https://www.hktvmall.com/hktv/zh/ajax/search_products?query=%22${query}%22%3Arelevance&pageSize=${resultsForPage}`;
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
            firebase.database().ref(`app/hktvmall/${that.props.filename}`.replace('.jpg', '')).set(json.products);
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

  searchPchome() {
    // http://ecshweb.pchome.com.tw/search/v3.3/all/results?q=books&page=1&sort=rnk/dc
    const query = encodeURIComponent(this.props.query);
    const url = `https://ecshweb.pchome.com.tw/search/v3.3/all/results?q=${query}&page=1&sort=rnk/dc`;
    console.log('encodeURIComponent', url);
    const that = this;
    fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      if (json.prods && json.prods.length > 0) {
        that.setState(Object.assign({}, json, {
          dataSource: that.state.dataSource.cloneWithRows(json.prods),
          key: Math.random(),
          hasResult: true,
        }));

        try {
          if (that.props.filename) {
            firebase.database().ref(`app/pchome/${that.props.filename}`.replace('.jpg', '')).set(json.prods);
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

  searchBooks() {
    const query = encodeURIComponent(this.props.query.replace(/\s/g, '+'));
    console.log('encodeURIComponentquery', query);
    // http://search.books.com.tw/search/query/cat/all/key/${query}
    const url = `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fsearch.books.com.tw%2Fsearch%2Fquery%2Fkey%2F${query}%22%20and%20xpath%3D%22%2F%2Ful%5B%40class%3D%5C'searchbook%5C'%5D%2F%2Fli%22&format=json&diagnostics=true&callback=`;    // eslint-disable-line max-len
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
          dataSource: that.state.dataSource.cloneWithRows(json.query.count === 1 ? [json.query.results.li] : json.query.results.li),
          key: Math.random(),
          hasResult: true,
        }));

        try {
          if (that.props.filename) {
            firebase.database().ref(`app/books/${that.props.filename}`.replace('.jpg', '')).set(json.query.results.li);
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

  searchGoogleSearch(country) {
    const query = encodeURIComponent(this.props.query);
    const resultsForPage = 10;
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${googleSearch[country]}&key=${googleSearch.key}&lr=lang_zh-TW&num=${resultsForPage}`;
    console.log('encodeURIComponent', url);
    const that = this;
    fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      if (json.items && json.items.length > 0) {
        that.setState(Object.assign({}, json, {
          dataSource: that.state.dataSource.cloneWithRows(json.items),
          key: Math.random(),
          hasResult: true,
        }));

        try {
          if (that.props.filename) {
            firebase.database().ref(`app/googlesearch/${that.props.filename}`.replace('.jpg', '')).set(json.items);
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
          <Text>{strings.no_results}</Text>
        </View>}
        {!this.state.loading && this.state.hasResult && <ListView
          key={this.state.key}
          dataSource={this.state.dataSource}
          renderRow={(rowData, sectionID, rowID) => {
            if (this.props.shop === 'HKTVMALL') {
              return <HktvmallMallItemCell item={rowData} rowID={rowID} />;
            } else if (this.props.shop === 'PARKNSHOP') {
              return <ParknshopMallItemCell item={rowData} rowID={rowID} />;
            } else if (this.props.shop === 'PCHOME') {
              return <PchomeMallItemCell item={rowData} rowID={rowID} />;
            } else if (this.props.shop === 'BOOKS') {
              return <BooksMallItemCell item={rowData} rowID={rowID} />;
            } else if (this.props.shop === 'GOOGLESEARCH') {
              return <GoogleMallItemCell item={rowData} rowID={rowID} />;
            }

            return <HktvmallMallItemCell item={rowData} rowID={rowID} />;
          }}
        />}
      </View>
    );
  }
}

MallCell.propTypes = {
  elements: React.PropTypes.array,
  shop: React.PropTypes.string,
  query: React.PropTypes.string,
  filename: React.PropTypes.string,
  country: React.PropTypes.string,
};

MallCell.defaultProps = {
  elements: ['tag'],
  shop: 'hktv',
  country: 'HK',
};
