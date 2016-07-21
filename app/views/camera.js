import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

// 3rd party libraries
import { Actions } from 'react-native-router-flux';
import Camera from 'react-native-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.preview}
          captureAudio={false}
          aspect={Camera.constants.Aspect.fill}
        >
          <Icon name="photo-camera" style={styles.capture} size={40} color="white" onPress={() => this.takePicture()} />
        </Camera>
      </View>
    );
  }
}
