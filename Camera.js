import React, { Component } from 'react';

// Views
import Camera from './app/views/camera';
import Result from './app/views/result';

// 3rd party libraries
import { Actions, Scene, Router } from 'react-native-router-flux';

const scenes = Actions.create(
  <Scene key="root">
    <Scene key="camera" title="Camera" component={Camera} hideNavBar={true} initial={true} />
    <Scene key="result" title="Result" component={Result} hideNavBar={true} />
  </Scene>
);

export default class App extends Component {
  render() {
    return <Router scenes={scenes} />;
  }
}
