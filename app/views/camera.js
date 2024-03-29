import React, { Component } from 'react';
import {
  Alert,
  Dimensions,
  ImagePickerIOS,
  StyleSheet,
  Text,
  TouchableHighlight,
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

import { locale } from './../locale';
const strings = locale.zh_Hant;

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
    marginBottom: 24,
    paddingTop: 50,
    paddingRight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    marginBottom: 24,
    paddingTop: 50,
    paddingLeft: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
});

export default class CameraView extends Component {
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
          this.setState({ permission: 'CAMERA-DENIED' });
        } else if (response.photo !== 'authorized' && response.photo !== 'undetermined') {
          this.setState({ permission: 'PHOTO-DENIED' });
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

  askPermission(permission) {
    Permissions.checkMultiplePermissions([permission])
      .then(response => {
        // response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        console.log('Permission status', response);
        if (response.camera !== 'authorized' && response.camera !== 'undetermined') {
          this.setState({ permission: 'CAMERA-DENIED' });
          Alert.alert(
            strings.ask_camera_permission,
            strings.ask_permission_description,
            [
              { text: strings.no_way, onPress: () => console.log('permission denied'), style: 'cancel' },
              { text: strings.open_settings, onPress: Permissions.openSettings },
            ]
          );
        } else if (response.photo !== 'authorized' && response.photo !== 'undetermined') {
          this.setState({ permission: 'PHOTO-DENIED' });
          Alert.alert(
            strings.ask_camera_permission,
            strings.ask_permission_description,
            [
              { text: strings.no_way, onPress: () => console.log('permission denied'), style: 'cancel' },
              { text: strings.open_settings, onPress: Permissions.openSettings },
            ]
          );
        } else {
          this.setState({ permission: 'ALLOWED' });
        }
      });
  }

  askLocation(data) {
    Alert.alert(
      strings.select_location,
      '',
      [
        { text: strings.hong_kong, onPress: () => {
          store.save('Country', 'HK');
          Actions.result({ data, country: 'HK' });
        } },
        { text: strings.taiwan, onPress: () => {
          store.save('Country', 'TW');
          Actions.result({ data, country: 'TW' });
        } },
        { text: strings.cancel, style: 'cancel' },
      ]
    );
  }

  takePicture() {
    const that = this;
    this.camera.capture().then((data) => {
      GoogleAnalytics.trackEvent('user-action', 'take-picture');
      console.log(data);
      if (data) {
        store.get('Country').then(Country => {
          if (Country) {
            Actions.result({ data, country: Country });
          } else {
            that.askLocation(data);
          }
        });
      }
    })
    .catch(err => console.error(err));
  }

  pickImage() {
    const that = this;
    ImagePickerIOS.openSelectDialog({}, (response) => {
      GoogleAnalytics.trackEvent('user-action', 'pick-image');
      console.log(response);
      if (response) {
        store.get('Country').then(Country => {
          if (Country) {
            Actions.result({ data: { path: response }, country: Country });
          } else {
            that.askLocation({ path: response });
          }
        });
      }
    }, (err) => console.log(err));
  }

  render() {
    GoogleAnalytics.trackScreenView('Camera');
    return (
      <View style={styles.container}>
        {this.state.permission === 'CAMERA-DENIED' && <View style={styles.preview}>
          <View style={styles.cameraIcons}>
            <TouchableHighlight onPress={() => this.pickImage()} underlayColor="black">
              <View style={styles.library}>
                <Icon name="photo-library" size={26} color="white" />
                <Text style={styles.text}>{strings.library}</Text>
              </View>
            </TouchableHighlight>

            <Icon name="photo-camera" style={styles.capture} size={52} color="white" onPress={() => this.askPermission('camera')} />

            <TouchableHighlight onPress={() => Actions.timeline()} underlayColor="black">
              <View style={styles.moreButton}>
                <Icon name="format-list-bulleted" size={26} color="white" />
                <Text style={styles.text}>{strings.timeline}</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>}

        {this.state.permission !== 'CAMERA-DENIED' && <Camera
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
            <TouchableHighlight onPress={() => this.pickImage()} underlayColor="transparent">
              <View style={styles.library}>
                <Icon name="photo-library" size={26} color="white" />
                <Text style={styles.text}>{strings.library}</Text>
              </View>
            </TouchableHighlight>

            <Icon name="photo-camera" style={styles.capture} size={52} color="white" onPress={() => this.takePicture()} />

            <TouchableHighlight onPress={() => Actions.timeline()} underlayColor="transparent">
              <View style={styles.moreButton}>
                <Icon name="format-list-bulleted" size={26} color="white" />
                <Text style={[styles.text, { fontSize: 12 }]}>{strings.timeline}</Text>
              </View>
            </TouchableHighlight>
          </View>
        </Camera>}
      </View>
    );
  }
}
