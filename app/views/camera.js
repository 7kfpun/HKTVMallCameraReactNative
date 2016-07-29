import React, { Component } from 'react';
import {
  Alert,
  Dimensions,
  ImagePickerIOS,
  StyleSheet,
  Vibration,
  View,
} from 'react-native';

// 3rd party libraries
import { Actions } from 'react-native-router-flux';
import Camera from 'react-native-camera';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Permissions from 'react-native-permissions';  // eslint-disable-line import/no-unresolved
import store from 'react-native-simple-store';

let lastScan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  cameraIcons: {
    width: Dimensions.get('window').width - 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  capture: {
    marginBottom: 20,
    paddingTop: 50,
  },
  library: {
    marginBottom: 25,
    paddingTop: 50,
    paddingRight: 40,
  },
  moreButton: {
    marginBottom: 25,
    paddingTop: 50,
    paddingLeft: 40,
  },
});

export default class BadInstagramCloneApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      permission: 'DENIED',
    };
  }

  componentDidMount() {
    Permissions.checkMultiplePermissions(['camera', 'photo'])
      .then(response => {
        // response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        console.log('Permission status', response);
        if (response.camera !== 'authorized' && response.camera !== 'undetermined') {
          this.setState({ permission: 'DENIED' });
          Alert.alert(
            'Can we access your camera?',
            'We need access so you can use the function.',
            [
              { text: 'No way', onPress: () => console.log('permission denied'), style: 'cancel' },
              { text: 'Open Settings', onPress: Permissions.openSettings },
            ]
          );
        } else if (response.photo !== 'authorized' && response.photo !== 'undetermined') {
          this.setState({ permission: 'DENIED' });
          Alert.alert(
            'Can we access your photos?',
            'We need access so you can use the function.',
            [
              { text: 'No way', onPress: () => console.log('permission denied'), style: 'cancel' },
              { text: 'Open Settings', onPress: Permissions.openSettings },
            ]
          );
        } else {
          this.setState({ permission: 'ALLOWED' });
        }
      });
  }

  onBarCodeRead(e) {
    const timestamp = Math.round(new Date().getTime() / 1000 / 4);
    if (e.type === 'org.gs1.EAN-13' && lastScan !== timestamp) {
      lastScan = timestamp;
      const temp = e;
      delete temp.type;
      Vibration.vibrate();
      Actions.barcodeResult(temp);
    }
    // if (e.data !== this.state.barcode || e.type !== this.state.type) {}

    this.setState({
      barcode: e.data,
      text: `${e.data} (${e.type})`,
      type: e.type,
    });
  }

  takePicture() {
    this.camera.capture().then((data) => {
      console.log(data);
      if (data) {
        store.get('Country').then(Country => {
          if (Country) {
            Actions.result({ data });
            GoogleAnalytics.trackEvent('user-action', 'take-picture');
          } else {
            Alert.alert(
              'Select your location',
              '',
              [
                { text: 'Hong Kong', onPress: () => {
                  store.save('Country', 'HK');
                  Actions.result({ data });
                  GoogleAnalytics.trackEvent('user-action', 'take-picture');
                } },
                { text: 'Taiwan', onPress: () => {
                  store.save('Country', 'TW');
                  Actions.result({ data });
                  GoogleAnalytics.trackEvent('user-action', 'take-picture');
                } },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }
        });
      }
    })
    .catch(err => console.error(err));
  }

  pickImage() {
    ImagePickerIOS.openSelectDialog({}, (response) => {
      console.log(response);
      if (response) {
        store.get('Country').then(Country => {
          if (Country) {
            Actions.result({ data: { path: response } });
            GoogleAnalytics.trackEvent('user-action', 'pick-image');
          } else {
            Alert.alert(
              'Select your location',
              '',
              [
                { text: 'Hong Kong', onPress: () => {
                  store.save('Country', 'HK');
                  Actions.result({ data: { path: response } });
                  GoogleAnalytics.trackEvent('user-action', 'pick-image');
                } },
                { text: 'Taiwan', onPress: () => {
                  store.save('Country', 'TW');
                  Actions.result({ data: { path: response } });
                  GoogleAnalytics.trackEvent('user-action', 'pick-image');
                } },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }
        });
      }
    }, (err) => console.log(err));
  }

  render() {
    GoogleAnalytics.trackScreenView('Camera');
    return (
      <View style={styles.container}>
        {this.state.permission !== 'DENIED' && <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.preview}
          captureAudio={false}
          aspect={Camera.constants.Aspect.fill}
          captureTarget={Camera.constants.CaptureTarget.temp}
          onBarCodeRead={data => this.onBarCodeRead(data)}
        >
          <View style={styles.cameraIcons}>
            <Icon name="photo-library" style={styles.library} size={26} color="white" onPress={() => this.pickImage()} />
            <Icon name="photo-camera" style={styles.capture} size={52} color="white" onPress={() => this.takePicture()} />
            <Icon name="format-list-bulleted" style={styles.moreButton} size={28} color="white" onPress={() => Actions.more()} />
          </View>
        </Camera>}
      </View>
    );
  }
}
