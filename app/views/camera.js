import React, { Component } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

// 3rd party libraries
import { Actions } from 'react-native-router-flux';
import Camera from 'react-native-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Permissions from 'react-native-permissions';

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
  capture: {
    marginBottom: 10,
    padding: 20,
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

  render() {
    return (
      <View style={styles.container}>
        {this.state.permission !== 'DENIED' && <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.preview}
          captureAudio={false}
          aspect={Camera.constants.Aspect.fill}
        >
          <Icon name="photo-camera" style={styles.capture} size={40} color="white" onPress={() => this.takePicture()} />
        </Camera>}
      </View>
    );
  }
}
