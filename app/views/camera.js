import React, { Component } from 'react';
import {
  Alert,
  Dimensions,
  ImagePickerIOS,
  StyleSheet,
  View,
} from 'react-native';

// 3rd party libraries
import { Actions } from 'react-native-router-flux';
import Camera from 'react-native-camera';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Permissions from 'react-native-permissions';  // eslint-disable-line import/no-unresolved

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
  rectangleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  rectangle: {
    height: Dimensions.get('window').width - 40,
    width: Dimensions.get('window').width - 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  capture: {
    marginBottom: 20,
  },
  library: {
    position: 'absolute',
    left: 25,
    bottom: 25,
  },
  moreButton: {
    position: 'absolute',
    right: 25,
    bottom: 25,
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

  takePicture() {
    this.camera.capture()
      .then((data) => {
        console.log(data);
        Actions.result({ data });
      })
      .catch(err => console.error(err));
  }

  pickImage() {
    ImagePickerIOS.openSelectDialog({}, (response) => {
      console.log(response);
      if (response) {
        Actions.result({ data: { path: response } });
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
        >
          <View style={styles.rectangleContainer}>
            <View style={styles.rectangle} />
          </View>
          <Icon name="photo-camera" style={styles.capture} size={52} color="white" onPress={() => this.takePicture()} />
        </Camera>}
        <Icon name="photo-library" style={styles.library} size={26} color="white" onPress={() => this.pickImage()} />
        <Icon name="format-list-bulleted" style={styles.moreButton} size={28} color="white" onPress={() => Actions.more()} />
      </View>
    );
  }
}
