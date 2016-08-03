import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';

import firebase from 'firebase';

// 3rd party libraries
import Button from 'apsl-react-native-button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import store from 'react-native-simple-store';

// Elements
// import HktvmallMallItemCell from './hktvmall-mall-item-cell';
// import ParknshopMallItemCell from './parknshop-mall-item-cell';
// import PchomeMallItemCell from './pchome-mall-item-cell';
// import BooksMallItemCell from './books-mall-item-cell';

// Components
import MallCell from './../components/mall-cell';

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
    right: 5,
    top: 5,
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
    store.get('Country').then(Country => {
      if (Country) {
        this.setState({ country: Country });
        if (Country === 'HK') {
          this.setState({ shop: 'HKTVMALL' });
        } else if (Country === 'TW') {
          this.setState({ shop: 'PCHOME' });
        }
      }
    });

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
          mediaLink: value.mediaLink,
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

  delete(image) {
    firebase.database().ref(`app/img/${image}/isDeleted`).set(true);
    this.setState({ isDeleted: true });
  }

  render() {
    if (!this.state.isDeleted) {
      return (
        <View style={styles.container}>
          <TouchableHighlight onPress={() => console.log()} underlayColor="white">
            <View>
              <Image
                style={styles.image}
                source={{ uri: this.state.mediaLink }}
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
