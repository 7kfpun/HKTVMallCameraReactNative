import React, { Component } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

// 3rd party libraries
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import NavigationBar from 'react-native-navbar';

import DeviceInfo from 'react-native-device-info';
import { Cell, Section, TableView } from 'react-native-tableview-simple';
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
});

export default class MoreView extends Component {
  constructor(props) {
    super(props);

    this.state = {};
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
            {/* <Section header="SAVED"></Section> */}
            <Section header="INFO">
              <Cell
                cellstyle="RightDetail"
                title="Disclaimer"
                onPress={() => Alert.alert(
                  'Disclaimer',
                  '',
                  [
                    { text: 'OK', onPress: () => console.log('OK Pressed') },
                  ]
                )}
              />
              <Cell
                cellstyle="RightDetail"
                title="View More by This Developer"
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('https://itunes.apple.com/us/developer/kf-pun/id1116896894');
                  } else if (Platform.OS === 'android') {
                    Linking.openURL('https://play.google.com/store/apps/developer?id=Kf');
                  } }}
              />
            </Section>

            <Section>
              <Cell
                cellstyle="RightDetail"
                title="Version"
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
