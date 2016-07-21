import {
  AppRegistry,
} from 'react-native';

// 3rd party libraries
import GoogleAnalytics from 'react-native-google-analytics-bridge';

import Camera from './Camera';

import { config } from './app/config';

GoogleAnalytics.setTrackerId(config.googleAnalytics.ios);

AppRegistry.registerComponent('HKTVMallCamera', () => Camera);
