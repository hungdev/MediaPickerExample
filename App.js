/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  CameraRoll,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity
} from 'react-native';
var { height, width } = Dimensions.get('window')

import Reactotron from 'reactotron-react-native'
import MediaHelper from './MediaHelperIos'

export default class App extends Component<{}> {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  onPicker () {
    this.refs.MediaHelper.onPicker()
  }

  render() {
    return (
      <View style={styles.container}>
      <Button
          onPress={() => this.onPicker()}
          title="Get Item Camera Roll"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
        <MediaHelper 
        ref='MediaHelper' 
        onSelectedItem={(item)=> alert(item.node.image.uri)} 
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  checkIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'transparent',
  }
});
