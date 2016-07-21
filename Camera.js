import React, { Component } from 'react';

// Views
import Home from './app/views/home';
import Camera from './app/views/camera';

// 3rd parties
import { Actions, Scene, Router } from 'react-native-router-flux';

const scenes = Actions.create(
  <Scene key="root">
    <Scene key="result" title="Home" component={Home} hideNavBar={true} />
    <Scene key="camera" title="Camera" component={Camera} hideNavBar={true} initial={true} />
  </Scene>
);

export default class App extends Component {
  render() {
    return <Router scenes={scenes} />;
  }
}
