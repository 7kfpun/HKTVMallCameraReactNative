import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// 3rd party libraries
import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageResizer from 'react-native-image-resizer'; // eslint-disable-line import/no-unresolved
import RNFetchBlob from 'react-native-fetch-blob';
import Spinner from 'react-native-spinkit';

// Components
import LabelsCell from './../components/labels-cell';
import LogosCell from './../components/logos-cell';
import MallCell from './../components/mall-cell';

import { config } from './../config';

const gcloudStorage = config.gcloudStorage;
const gcloudVision = config.gcloudVision;

// import firebase from 'firebase';
// firebase.initializeApp(config.firebase);

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
  brandText: {
    color: '#424242',
    fontSize: 16,
    fontWeight: '500',
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

      const filename = /id=(.*)\&ext/i.exec(this.props.data.path)[0].replace('id=', '').replace('&ext', '');  // eslint-disable-line no-useless-escape

      RNFetchBlob.fetch(
        'POST',
        `https://www.googleapis.com/upload/storage/v1/b/${gcloudStorage}/o?uploadType=media&name=${filename}.jpg`,
        {
          'Content-Type': 'image/jpeg',
        },
        RNFetchBlob.wrap(resizedImageUri)
      )
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
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
                    maxResults: 5,
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
    let query = '';
    if (this.state.logoAnnotations) {
      query += this.state.logoAnnotations[0].description;
    }
    if (this.state.labelAnnotations) {
      query += ' ';
      query += this.state.labelAnnotations.map((el) => el.description).slice(0, 4).join();
    }
    console.log('query', query);
    return (
      <ScrollView style={styles.container}>
        <Image
          style={styles.image}
          source={{ uri: this.props.data.path }}
        >
          <Icon name="keyboard-arrow-left" style={styles.back} size={30} color="white" onPress={() => Actions.pop()} />
        </Image>
        {!this.state.vision && <View style={styles.loading}>
          <Spinner style={styles.spinner} isVisible={this.state.isVisible} size={40} type={'Pulse'} color={'#424242'} />
        </View>}
        {this.state.vision && <View style={styles.results}>
          {this.state.logoAnnotations && <View style={{ flexDirection: 'row' }}>
            <Text style={styles.brandText}>Brand: </Text>
            <LogosCell elements={this.state.logoAnnotations} />
          </View>}
          {this.state.labelAnnotations && <LabelsCell elements={this.state.labelAnnotations} />}
          {query !== '' && <MallCell query={query} />}
        </View>}
      </ScrollView>
    );
  }
}

HKTVMallCamera.propTypes = {
  data: React.PropTypes.object,
};

HKTVMallCamera.defaultProps = {
  data: {},
};
