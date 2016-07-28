import React, { Component } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import firebase from 'firebase';

// 3rd party libraries
import { Actions } from 'react-native-router-flux';
import Button from 'apsl-react-native-button';
import Collapsible from 'react-native-collapsible';
import DeviceInfo from 'react-native-device-info';
import Egg from 'react-native-egg';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageResizer from 'react-native-image-resizer'; // eslint-disable-line import/no-unresolved
import RNFetchBlob from 'react-native-fetch-blob';
import Share from 'react-native-share';
import Spinner from 'react-native-spinkit';

// Components
// import LabelsCell from './../components/labels-cell';
// import LogoCell from './../components/logo-cell';
// import TextCell from './../components/text-cell';
import MallCell from './../components/mall-cell';

import { config } from './../config';

const gcloudStorage = config.gcloudStorage;
const gcloudVision = config.gcloudVision;

const uniqueID = DeviceInfo.getUniqueID();

const { width } = Dimensions.get('window');

let OFFSETY;

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
    width,
    height: width,
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
    paddingHorizontal: 10,
  },
  buttonText: {
    color: '#616161',
    fontSize: 12,
  },
  buttonStyle: {
    borderRadius: 0,
    height: 20,
    marginRight: 4,
    paddingHorizontal: 4,
    backgroundColor: '#F5F5F5',
    borderColor: '#616161',
  },
  shopBlock: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 5,
  },
  shopIcon: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  selectedShopIcon: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: '#757575',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  shopImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
  },
  shopText: {
    color: '#424242',
    fontSize: 12,
  },
});

export default class HKTVMallCamera extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isCollapsed: false,
      shop: 'HKTVMALL',
    };
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
        console.log('Google bucket', json);
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
          console.log('Google vision', jjson);
          that.setState({ vision: jjson });

          if (jjson.responses && jjson.responses.length) {
            that.setState(jjson.responses[0]);
            console.log('labelAnnotations', that.state.labelAnnotations);
            console.log('logoAnnotations', that.state.logoAnnotations);
            console.log('textAnnotations', that.state.textAnnotations);

            that.getQuery();

            try {
              firebase.database().ref(`app/images/${filename}`.replace('.jpg', '')).set({
                uniqueID,
                timestamp: new Date().getTime(),
              });
              firebase.database().ref(`app/bucket/${filename}`.replace('.jpg', '')).set(json);
              firebase.database().ref(`app/vision/${filename}`.replace('.jpg', '')).set(jjson.responses[0]);
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

  onShareDeveloper() {
    Share.open({
      share_subject: 'MallCam report',
      share_text: `${JSON.stringify(this.state.logoAnnotations)} ${JSON.stringify(this.state.labelAnnotations)} ${JSON.stringify(this.state.textAnnotations)}`,
      share_URL: 'https://www.frontn.com',
      title: 'Share Link',
    }, (err) => {
      console.log(err);
    });
    GoogleAnalytics.trackEvent('user-action', 'report-developer');
  }

  getQuery() {
    let query = '';
    if (this.state.logoAnnotations) {
      query += this.state.logoAnnotations[0].description;
    }
    if (this.state.labelAnnotations && query === '') {
      let labels = this.state.labelAnnotations.filter((el) => el.score > 0.7).map((el) => el.description);
      if (labels.length === 0 && query === '') {
        labels = this.state.labelAnnotations.map((el) => el.description);
      }
      labels = labels.splice(0, 3);
      query += labels.join(' ');
    }
    console.log('Query:', query);
    this.setState({ query });
  }

  getTags() {
    const buttons = [];
    const { logoAnnotations, textAnnotations, labelAnnotations } = this.state;

    const MIN_TAGS = 5;
    if (logoAnnotations) {
      for (let index = 0; index < Math.min(MIN_TAGS, logoAnnotations.length); index++) {
        buttons.push(
          <Button
            key={index}
            style={[styles.buttonStyle]}
            textStyle={styles.buttonText}
            onPress={() => this.setState({ query: logoAnnotations[index].description, key: Math.random() })}
          >
            {logoAnnotations[index].description}
          </Button>
        );
      }
    }
    if (labelAnnotations) {
      for (let index = 0; index < Math.min(MIN_TAGS, labelAnnotations.length); index++) {
        buttons.push(
          <Button
            key={MIN_TAGS + index}
            style={[styles.buttonStyle]}
            textStyle={styles.buttonText}
            onPress={() => this.setState({ query: labelAnnotations[index].description, key: Math.random() })}
          >
            {labelAnnotations[index].description}
          </Button>
        );
      }
    }
    if (textAnnotations) {
      const texts = textAnnotations[0].description.split('\n').filter(item => item);
      for (let index = 0; index < Math.min(MIN_TAGS, texts.length); index++) {
        buttons.push(
          <Button
            key={MIN_TAGS * 2 + index}
            style={[styles.buttonStyle]}
            textStyle={styles.buttonText}
            onPress={() => this.setState({ query: texts[index], key: Math.random() })}
          >
            {texts[index]}
          </Button>
        );
      }
    }
    return buttons;
  }

  render() {
    GoogleAnalytics.trackScreenView('Result');

    return (
      <View style={styles.container}>
        {<ScrollView
          scrollEventThrottle={70}
          onScroll={(event) => {
            const currentOffset = event.nativeEvent.contentOffset.y;
            console.log('currentOffset', currentOffset);
            if (currentOffset <= 0) {
              console.log('onScroll toTop');
              this.setState({ isCollapsed: false });
            } else if (currentOffset - OFFSETY > 0) {
              console.log('onScroll Down');
              this.setState({ isCollapsed: true });
            } else if (OFFSETY - currentOffset > 0) {
              console.log('onScroll Up');
              this.setState({ isCollapsed: false });
            }
            OFFSETY = currentOffset;
          }}
        >
          <Egg
            setps={'TTTTTTTT'}
            onCatch={() => {
              Alert.alert('Developer mode?', null, [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Yes', onPress: () => Alert.alert(
                  'Developer mode',
                  `${JSON.stringify(this.state.logoAnnotations)} ${JSON.stringify(this.state.labelAnnotations)} ${JSON.stringify(this.state.textAnnotations)}`,
                  [
                    { text: 'Send to developer', onPress: () => this.onShareDeveloper() },
                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                  ]
                ) },
              ]);
            }}
          >
            <Image
              style={styles.image}
              source={{ uri: this.props.data.path }}
            />
          </Egg>
          <View style={styles.shopBlock}>
            <TouchableHighlight onPress={() => this.setState({ shop: 'HKTVMALL', key: Math.random() })} underlayColor="#E0E0E0">
              <View style={[styles.shopIcon, this.state.shop === 'HKTVMALL' ? styles.selectedShopIcon : null]}>
                <Image
                  style={styles.shopImage}
                  source={require('./../../assets/hktvmall.png')}  // eslint-disable-line global-require
                />
                <Text style={styles.shopText}>HKTVmall</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={() => this.setState({ shop: 'PARKNSHOP', key: Math.random() })} underlayColor="#E0E0E0">
              <View style={[styles.shopIcon, this.state.shop === 'PARKNSHOP' ? styles.selectedShopIcon : null]}>
                <Image
                  style={styles.shopImage}
                  source={require('./../../assets/parknshop.png')}  // eslint-disable-line global-require
                />
                <Text style={styles.shopText}>ParknShop</Text>
              </View>
            </TouchableHighlight>
          </View>
          {!this.state.vision && <View style={styles.loading}>
            <Spinner style={styles.spinner} isVisible={this.state.isVisible} size={40} type={'Pulse'} color={'#424242'} />
          </View>}
          {this.state.vision && <View style={styles.results}>
            {/* {this.state.logoAnnotations && <View style={{ flexDirection: 'row' }}>
              <LogoCell elements={this.state.logoAnnotations} />
            </View>}
            {this.state.isDeveloper && this.state.labelAnnotations && <LabelsCell elements={this.state.labelAnnotations} />}
            {this.state.textAnnotations && <TextCell elements={this.state.textAnnotations} />} */}
            {this.state.query && <MallCell key={this.state.key} shop={this.state.shop} query={this.state.query} filename={this.state.filename} />}
          </View>}
        </ScrollView>}
        <Icon name="keyboard-arrow-left" style={styles.back} size={30} color="#616161" onPress={() => Actions.pop()} />

        <Collapsible collapsed={this.state.isCollapsed}>
          <View style={{ height: 40, backgroundColor: '#616161', justifyContent: 'space-between', alignItems: 'center', padding: 10, flexDirection: 'row' }}>
            <ScrollView
              style={{ flexDirection: 'row' }}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              {this.getTags()}
            </ScrollView>
            <Icon name="more-vert" size={26} color="white" onPress={() => console.log()} />
          </View>
        </Collapsible>
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
