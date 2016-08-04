import React, { Component } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';

import firebase from 'firebase';

// 3rd party libraries
import { Actions } from 'react-native-router-flux';
import Button from 'apsl-react-native-button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import store from 'react-native-simple-store';

import { locale } from './../locale';
const strings = locale.zh_Hant;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginTop: 10,
    marginHorizontal: 10,
    borderBottomColor: '#CCCCCC',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  delete: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  image: {
    width: Dimensions.get('window').width - 20,
    height: Dimensions.get('window').width / 2,
    resizeMode: 'cover',
  },
  tagsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  buttonText: {
    color: '#757575',
    fontSize: 12,
  },
  buttonStyle: {
    borderRadius: 0,
    height: 20,
    marginRight: 4,
    paddingHorizontal: 4,
    backgroundColor: '#EEEEEE',
    borderColor: '#EEEEEE',
  },
});

export default class TimelineCell extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    this.getFirebaseBucket();
    this.getFirebaseVision();
  }

  getFirebaseBucket() {
    const that = this;
    const ref = firebase.database().ref(`app/bucket/${this.props.image.id}`);
    ref.once('value').then((snapshot) => {
      if (snapshot) {
        const value = snapshot.val();
        // console.log(Object.keys(value), value);
        that.setState({
          vision: value,
          loading: false,
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getFirebaseVision() {
    const that = this;
    const ref = firebase.database().ref(`app/vision/${this.props.image.id}`);
    ref.once('value').then((snapshot) => {
      if (snapshot) {
        const value = snapshot.val();
        // console.log(Object.keys(value), value);
        that.setState({
          labelAnnotations: value.labelAnnotations,
          logoAnnotations: value.logoAnnotations,
          textAnnotations: value.textAnnotations,
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getTags() {
    const buttons = [];
    const { logoAnnotations, textAnnotations, labelAnnotations } = this.state;

    const MIN_TAGS = 10;
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

  getResult() {
    store.get('Country').then(Country => {
      if (Country) {
        Actions.result({
          fromTimeline: true,
          data: Object.assign({ path: this.state.vision.mediaLink }, this.state.vision),
          country: Country,
        });
      } else {
        Alert.alert(
          strings.select_location,
          '',
          [
            { text: strings.hong_kong, onPress: () => {
              store.save('Country', 'HK');
              Actions.result({
                fromTimeline: true,
                data: Object.assign({ path: this.state.vision.mediaLink }, this.state.vision),
                country: 'HK',
              });
            } },
            { text: strings.taiwan, onPress: () => {
              store.save('Country', 'TW');
              Actions.result({
                fromTimeline: true,
                data: Object.assign({ path: this.state.vision.mediaLink }, this.state.vision),
                country: 'TW',
              });
            } },
            { text: strings.cancel, style: 'cancel' },
          ]
        );
      }
    });
  }

  delete(image) {
    firebase.database().ref(`app/img/${image}/isDeleted`).set(true);
    this.setState({ isDeleted: true });
  }

  render() {
    if (!this.state.isDeleted) {
      return (
        <View style={styles.container}>
          <TouchableHighlight onPress={() => this.getResult()} underlayColor="white">
            <View>
              <Image
                style={styles.image}
                source={{ uri: this.state.vision && this.state.vision.mediaLink }}
              />
              <View style={styles.tagsBar}>
                {this.getTags()}
              </View>
            </View>
          </TouchableHighlight>

          <Icon style={styles.delete} name="delete-forever" size={20} color="#757575" onPress={() => this.delete(this.props.image.id)} />
        </View>
      );
    }

    return null;
  }
}

TimelineCell.propTypes = {
  image: React.PropTypes.object,
};

TimelineCell.defaultProps = {
  image: {},
};
