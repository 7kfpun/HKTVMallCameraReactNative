import React, { Component } from 'react';
import {
  Platform,
} from 'react-native';

// Views
import Camera from './app/views/camera';
import Result from './app/views/result';
import BarcodeResult from './app/views/barcode-result';
import More from './app/views/more';

import firebase from 'firebase';

// 3rd party libraries
import { Actions, Scene, Router } from 'react-native-router-flux';
import DeviceInfo from 'react-native-device-info';
import GoogleAnalytics from 'react-native-google-analytics-bridge';

import { config } from './app/config';

firebase.initializeApp(config.firebase);

GoogleAnalytics.setTrackerId(config.googleAnalytics[Platform.OS]);

if (DeviceInfo.getDeviceName() === 'iPhone Simulator') {
  GoogleAnalytics.setDryRun(true);
}

const scenes = Actions.create(
  <Scene key="root">
    <Scene key="camera" title="Camera" component={Camera} hideNavBar={true} initial={true} />
    <Scene key="result" title="Result" component={Result} hideNavBar={true} />
    <Scene key="barcodeResult" title="Result" component={BarcodeResult} hideNavBar={true} />
    <Scene key="more" title="More" component={More} hideNavBar={true} />
  </Scene>
);

export default class App extends Component {
  render() {
    return <Router scenes={scenes} />;
  }
}
