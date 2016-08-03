import React, { Component } from 'react';
import {
  ListView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import _ from 'underscore';
import firebase from 'firebase';

// 3rd party libraries
import { Actions } from 'react-native-router-flux';
import DeviceInfo from 'react-native-device-info';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NavigationBar from 'react-native-navbar';
import Spinner from 'react-native-spinkit';

// Components
import TimelineCell from './../components/timeline-cell';

import { locale } from './../locale';
const strings = locale.zh_Hant;

const uniqueID = DeviceInfo.getUniqueID();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    margin: 50,
  },
});

export default class TimelineView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      loading: true,
    };
  }

  componentDidMount() {
    this.prepareRows();
  }

  prepareRows() {
    const that = this;
    const ref = firebase.database().ref('app/img');
    ref.orderByChild('uniqueID').equalTo(uniqueID).once('value')
      .then((snapshot) => {
        const value = snapshot.val();
        if (value) {
          let images = Object.keys(value).map((key) => Object.assign({ id: key }, value[key]));
          images = images.filter((item) => !item.isDeleted);
          images = _.sortBy(images, 'timestamp');
          console.log(images);
          if (images.length > 0) {
            images.reverse();
            that.setState({
              dataSource: this.state.dataSource.cloneWithRows(images),
              hasResult: true,
            });
          } else {
            that.setState({
              hasResult: false,
            });
          }
        } else {
          that.setState({
            hasResult: false,
          });
        }

        that.setState({
          loading: false,
        });
      })
      .catch((error) => {
        console.error(error);
        that.setState({
          loading: false,
          hasResult: false,
        });
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
        rightButton={<Icon
          style={styles.navigatorRightButton}
          name="settings"
          size={26}
          color="white"
          onPress={Actions.more}
        />}
      />
    );
  }

  render() {
    GoogleAnalytics.trackScreenView('Timeline');

    return (
      <View style={styles.container}>
        {this.renderToolbar()}
        {this.state.loading && <View style={styles.loading}>
          <Spinner style={styles.spinner} isVisible={this.state.isVisible} size={40} type={'Pulse'} color={'#424242'} />
        </View>}
        {!this.state.loading && !this.state.hasResult && <View style={styles.noResults}>
          <Text>{strings.no_results}</Text>
        </View>}
        {!this.state.loading && this.state.hasResult && <ListView
          key={this.state.key}
          dataSource={this.state.dataSource}
          renderRow={(rowData) => <TimelineCell image={rowData} />}
        />}
      </View>
    );
  }
}

TimelineView.propTypes = {
  title: React.PropTypes.string,
  data: React.PropTypes.object,
};

TimelineView.defaultProps = {
  title: '',
  data: {},
};
