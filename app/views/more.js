import React, { Component } from 'react';
import {
  Alert,
  Linking,
  ListView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

// 3rd party libraries
import { Actions } from 'react-native-router-flux';
import { Cell, Section, TableView } from 'react-native-tableview-simple';
import DeviceInfo from 'react-native-device-info';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NavigationBar from 'react-native-navbar';
import SafariView from 'react-native-safari-view';
import store from 'react-native-simple-store';

import { locale } from './../locale';
const strings = locale.zh_Hant;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4',
  },
  navigatorBarIOS: {
    backgroundColor: '#455A64',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#37474F',
  },
  navigatorLeftButton: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 50,
  },
  navigatorRightButton: {
    paddingTop: 10,
    paddingLeft: 50,
    paddingRight: 10,
  },
  savedItem: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCCCCC',
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: 'cover',
    marginLeft: 10,
  },
});

export default class MoreView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      hasSaved: false,
    };
  }

  componentDidMount() {
    this.prepareSavedItems();

    store.get('Country').then(Country => {
      if (Country) {
        this.setCountry(Country);
      }
    });
  }

  onOpenUrl(url) {
    // const hktvUrl = `https://www.hktvmall.com/${url}?utm_source=MallCam&utm_medium=app&utm_term=MayIHaveAShortMeetingWithYou&utm_content=hey@frontn.com&utm_campaign=HiRickyWong&ref=MayIHaveAShortMeetingWithYou`;  // eslint-disable-line max-len
    const hktvUrl = `https://www.hktvmall.com/${url}?utm_source=MallCam&utm_medium=app&utm_campaign=HiRickyWong`;
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
    GoogleAnalytics.trackEvent('user-action', 'open-url-in-saved');
  }

  setCountry(code) {
    console.log(code);
    this.setState({ country: code });
    store.save('Country', code);
  }

  prepareSavedItems() {
    const that = this;
    store.get('Product').then(Product => {
      if (Product && Product.length > 0) {
        that.setState({
          dataSource: that.state.dataSource.cloneWithRows(Product),
          hasSaved: true,
        });
      } else {
        that.setState({ hasSaved: false });
      }
    });
  }

  removeItem(item, rowID) {
    const that = this;
    store.get('Product').then(savedProduct => {
      if (savedProduct.length > 0) {
        savedProduct.splice(rowID, 1);
        store.save('Product', savedProduct);

        if (savedProduct.length > 0) {
          that.setState({
            dataSource: that.state.dataSource.cloneWithRows(savedProduct),
            hasSaved: true,
          });
        } else {
          that.setState({ hasSaved: false });
        }
      }
    });
  }

  renderToolbar() {
    return (
      <NavigationBar
        statusBar={{ tintColor: '#455A64', style: 'light-content' }}
        style={styles.navigatorBarIOS}
        title={{ title: this.props.title, tintColor: 'white' }}
        leftButton={<Icon
          style={styles.navigatorLeftButton}
          name="arrow-back"
          size={26}
          color="white"
          onPress={Actions.pop}
        />}
      />
    );
  }

  render() {
    GoogleAnalytics.trackScreenView('More');

    return (
      <View style={styles.container}>
        {this.renderToolbar()}
        <ScrollView>
          <TableView>
            {/* <Section header={strings.saved.toUpperCase()}>
              {this.state.hasSaved && <ListView
                key={this.state.key}
                dataSource={this.state.dataSource}
                renderRow={(rowData, sectionID, rowID) => <TouchableHighlight onPress={() => this.onOpenUrl(rowData.url)} underlayColor="#E0E0E0">
                  <View style={styles.savedItem}>
                    <Icon name="remove-circle" style={{ paddingHorizontal: 5 }} size={25} color="red" onPress={() => this.removeItem(rowData, rowID)} />
                    {rowData.images && rowData.images.length > 0 && <Image
                      style={styles.image}
                      source={{ uri: rowData.images[0].url.startsWith('http') ?
                                  rowData.images[0].url.replace('http', 'https')
                                  :
                                  `https://www.hktvmall.com${rowData.images[0].url}`,
                                }}
                    />}
                    <View style={{ paddingLeft: 10, flexDirection: 'column' }}>
                      <Text>{rowData.brandName}</Text>
                      <Text style={{ color: '#424242' }}>{rowData.name.length > 22 ? `${rowData.name.substring(0, 22 - 3)}...` : rowData.name}</Text>
                    </View>
                  </View>
                </TouchableHighlight>}
              />}
            </Section>

            <Section>
              <Cell
                cellStyle="RightDetail"
                title="Clear all"
                onPress={() => Alert.alert(
                  'Confirm',
                  '',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'OK', onPress: () => {
                      store.save('Product', []);
                      this.prepareSavedItems();
                    } },
                  ]
                )}
              />
            </Section> */}

            <Section header={strings.location.toUpperCase()}>
              <Cell cellStyle="Basic" accessory={this.state.country === 'HK' ? 'Checkmark' : null} title={strings.hong_kong} onPress={() => this.setCountry('HK')} />
              <Cell cellStyle="Basic" accessory={this.state.country === 'TW' ? 'Checkmark' : null} title={strings.taiwan} onPress={() => this.setCountry('TW')} />
            </Section>

            {/* <Section>
              <Cell
                cellStyle="RightDetail"
                title="Clear city"
                onPress={() => Alert.alert(
                  'Confirm',
                  '',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'OK', onPress: () => store.delete('Country') },
                  ]
                )}
              />
            </Section> */}

            <Section header={strings.info.toUpperCase()}>
              <Cell
                cellStyle="RightDetail"
                title={strings.disclaimer}
                onPress={() => Alert.alert(
                  strings.disclaimer_details,
                  '',
                  [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                  ]
                )}
              />
              {/* <Cell
                cellStyle="RightDetail"
                title="View More by This Developer"
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('https://itunes.apple.com/us/developer/kf-pun/id1116896894');
                  } else if (Platform.OS === 'android') {
                    Linking.openURL('https://play.google.com/store/apps/developer?id=Kf');
                  } }}
              /> */}
            </Section>

            <Section>
              <Cell
                cellStyle="RightDetail"
                title={strings.version}
                detail={`${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`}
              />
            </Section>

          </TableView>
        </ScrollView>
      </View>
    );
  }
}

MoreView.propTypes = {
  title: React.PropTypes.string,
  data: React.PropTypes.object,
};

MoreView.defaultProps = {
  title: 'More',
  data: {},
};
