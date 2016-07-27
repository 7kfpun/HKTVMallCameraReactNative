import React, { Component } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import firebase from 'firebase';

// 3rd party libraries
import { Actions } from 'react-native-router-flux';
import DeviceInfo from 'react-native-device-info';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageResizer from 'react-native-image-resizer'; // eslint-disable-line import/no-unresolved
import RNFetchBlob from 'react-native-fetch-blob';
import Spinner from 'react-native-spinkit';

import Egg from 'react-native-egg';

// Components
import LabelsCell from './../components/labels-cell';
import LogoCell from './../components/logo-cell';
import TextCell from './../components/text-cell';
import MallCell from './../components/mall-cell';

import { config } from './../config';

const gcloudStorage = config.gcloudStorage;
const gcloudVision = config.gcloudVision;

const uniqueID = DeviceInfo.getUniqueID();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  back: {
    position: 'absolute',
    left: 10,
    top: 25,
  },
  imageBlock: {
    flex: 1,
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
    resizeMode: 'cover',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    margin: 50,
  },
  results: {
    padding: 10,
  },
});

export default class HKTVMallCamera extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    console.log('componentDidMount', this.props.data);

    const that = this;
    ImageResizer.createResizedImage(this.props.data.path, 500, 500, 'JPEG', 40).then((resizedImageUri) => {
      console.log('resizedImageUri', resizedImageUri);
      const filename = resizedImageUri.replace(/^.*[\\\/]/, '');
      that.setState({ filename });
      RNFetchBlob.fetch(
        'POST',
        `https://www.googleapis.com/upload/storage/v1/b/${gcloudStorage}/o?uploadType=media&name=${filename}`,
        {
          'Content-Type': 'image/jpeg',
        },
        RNFetchBlob.wrap(resizedImageUri)
      )
      .then((response) => response.json())
      .then((json) => {
        console.log('Google vision', json);
        const name = json.name;
        fetch(`https://vision.googleapis.com/v1/images:annotate?key=${gcloudVision}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  source: {
                    gcs_image_uri: `gs://${gcloudStorage}/${name}`,
                  },
                },
                features: [
                  {
                    type: 'LABEL_DETECTION',
                    maxResults: 10,
                  },
                  {
                    type: 'LOGO_DETECTION',
                    maxResults: 5,
                  },
                  {
                    type: 'TEXT_DETECTION',
                    maxResults: 15,
                  },
                ],
              },
            ],
          }),
        })
        .then((response) => response.json())
        .then((jjson) => {
          console.log(jjson);
          that.setState({ vision: jjson });

          if (jjson.responses && jjson.responses.length) {
            that.setState(jjson.responses[0]);
            console.log('labelAnnotations', that.state.labelAnnotations);
            console.log('logoAnnotations', that.state.logoAnnotations);
            console.log('textAnnotations', that.state.textAnnotations);

            try {
              firebase.database().ref(`users/${uniqueID}/${filename}/vision`.replace('.jpg', '')).set(jjson.responses[0]);

              firebase.database().ref(`app/images/${filename}`.replace('.jpg', '')).set({
                uniqueID,
                vision: jjson.responses[0],
                timestamp: new Date().getTime(),
              });
            } catch (err) {
              console.warn(err);
            }
          }
        })
        .catch((error) => {
          console.warn(error);
        });
      })
      .catch((error) => {
        console.warn(error);
      });
    }).catch((err) => {
      console.log('ImageResizer', err);
    });
  }

  render() {
    GoogleAnalytics.trackScreenView('Result');

    let query = '';
    if (this.state.logoAnnotations) {
      query += this.state.logoAnnotations[0].description;
    }
    if (this.state.labelAnnotations && query === '') {
      let labels = this.state.labelAnnotations.filter((el) => el.score > 0.7).map((el) => el.description);
      if (labels.length === 0 && query === '') {
        labels = this.state.labelAnnotations.map((el) => el.description);
      }
      labels = labels.splice(0, 5);
      query += ' ';
      query += labels.join();
    }
    console.log('Query:', query);
    return (
      <View style={styles.container}>
        <ScrollView >
          <Egg
            setps={'TTTTTTTT'}
            onCatch={() => {
              Alert.alert('Developer mode?', null, [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Yes', onPress: () => this.setState({ isDeveloper: true }) },
              ]);
            }}
          >
            <Image
              style={styles.image}
              source={{ uri: this.props.data.path }}
            />
          </Egg>
          {!this.state.vision && <View style={styles.loading}>
            <Spinner style={styles.spinner} isVisible={this.state.isVisible} size={40} type={'Pulse'} color={'#424242'} />
          </View>}
          {this.state.vision && <View style={styles.results}>
            {this.state.logoAnnotations && <View style={{ flexDirection: 'row' }}>
              <LogoCell elements={this.state.logoAnnotations} />
            </View>}
            {this.state.isDeveloper && this.state.labelAnnotations && <LabelsCell elements={this.state.labelAnnotations} />}
            {this.state.textAnnotations && <TextCell elements={this.state.textAnnotations} />}
            {query !== '' && <MallCell query={query} filename={this.state.filename} />}
          </View>}
        </ScrollView>
        <Icon name="keyboard-arrow-left" style={styles.back} size={30} color="#616161" onPress={() => Actions.pop()} />
      </View>
    );
  }
}

HKTVMallCamera.propTypes = {
  data: React.PropTypes.object,
};

HKTVMallCamera.defaultProps = {
  data: {},
};
