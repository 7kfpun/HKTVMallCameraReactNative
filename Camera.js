import React, { Component } from 'react';
import {
  Platform,
} from 'react-native';

// Views
import CameraView from './app/views/camera';
import ResultView from './app/views/result';
import BarcodeResultView from './app/views/barcode-result';
import MoreView from './app/views/more';
import TimelineView from './app/views/timeline';

import firebase from 'firebase';

// 3rd party libraries
import { Actions, Scene, Router } from 'react-native-router-flux';
import DeviceInfo from 'react-native-device-info';
import GoogleAnalytics from 'react-native-google-analytics-bridge';

import { config } from './app/config';
import { locale } from './app/locale';

const strings = locale.zh_Hant;

firebase.initializeApp(config.firebase);

GoogleAnalytics.setTrackerId(config.googleAnalytics[Platform.OS]);

if (DeviceInfo.getDeviceName() === 'iPhone Simulator') {
  GoogleAnalytics.setDryRun(true);
}

const scenes = Actions.create(
  <Scene key="root">
    <Scene key="camera" title="Camera" component={CameraView} hideNavBar={true} initial={true} />
    <Scene key="result" title="Result" component={ResultView} hideNavBar={true} />
    <Scene key="barcodeResult" title="Result" component={BarcodeResultView} hideNavBar={true} />
    <Scene key="more" title={strings.more} component={MoreView} hideNavBar={true} />
    <Scene key="timeline" title={strings.timeline} component={TimelineView} hideNavBar={true} />
  </Scene>
);

export default class App extends Component {
  render() {
    return <Router scenes={scenes} />;
  }
}
