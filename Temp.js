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
import RNThumbnail from 'react-native-thumbnail'
import _ from 'lodash'
import RNGRP from 'react-native-get-real-path'

export default class App extends Component<{}> {
  constructor(props) {
    super(props)
    this.state = {
      media: [],
      arrVideos: [],
      arrPhotos: []
    }
  }
  componentWillMount() {
    // Reactotron.log('hello rendering world')
    // this.getMedia('Videos')
  }

  onPicker() {
    // const uri = 'content://media/external/video/media/1285'
    // const path = 'file:///storage/emulated/0/DCIM/Camera/VID_20180310_162623.mp4'
    this.getMedia('Photos', 4)
    this.getMedia('Videos', 2)
    // this.getThumbnail(path)
    // this.getPathFromUri (filePath)
  }

  getMedia(media, num) {
    // CameraRoll.getPhotos({
    //   first: 20,
    //   assetType: 'Photos',
    // })
    // .then(r => {
    //   // this.setState({ photos: r.edges });
    //   Reactotron.log('pppp')
    //   Reactotron.log(r.edges)
    // })
    // .catch((err) => {
    //    //Error Loading Images
    // });
    CameraRoll.getPhotos({
      first: num,
      assetType: media,
    })
      .then(r => {
        if (media === 'Photos') {
          Reactotron.log('Photos')
          // Reactotron.log(media)
          Reactotron.log(r.edges)
          // this.setState({ photos: r.edges })
          var arrPhotos = _.map(r.edges, e => {
            e.node.image.thumbnailUrl = e.node.image.uri
            return e
          })
          // Reactotron.log('ppppp')
          // Reactotron.log(arrPhotos)
          this.setState({ arrPhotos })
        } else {
          this.setState({ videos: r.edges })
          const ArrVideos = _.map(r.edges, e => {
            RNGRP.getRealPathFromURI(e.node.image.uri).then(filePath =>
              RNThumbnail.get(`file://${filePath}`).then((result) => {
                e.node.image.thumbnailUrl = result.path
                this.setState({ arrVideos: _.uniqBy(_.concat(this.state.arrVideos, new Array(e)), (ele) => { return ele.node.timestamp }) })
              })
            )
          })
        }
      })
      .catch((err) => {
        //Error Loading Images
      })
  }

  onSelected(item) {
    this.setState({ selectedUriItem: item.node.image.uri, item: item })
  }

  renderItem(item) {
    // Reactotron.log('eeeeeee')
    // Reactotron.log(item.node.image)
    // Reactotron.log('iiiii')
    // Reactotron.log(item.node.image.path)
    // var imageSize = ((width - (this.props.imagesPerRow+1) * this.props.imageMargin) / this.props.imagesPerRow)
    var imageSize = ((width - (3 + 1) * 5) / 3)
    return (
      <TouchableOpacity onPress={() => this.onSelected(item)} style={{ marginBottom: 5, marginRight: 5, height: imageSize, width: imageSize, }}>
        <Image
          //  key={i}
          // source={{ uri: item.node.image.thumbnailUrl }}
          source={{ uri: item.node.image.thumbnailUrl }}
          style={{
            width: imageSize,
            height: imageSize,
          }}
        />
        {this.state.selectedUriItem === item.node.image.uri ? (
          <Image
            style={[styles.checkIcon, { width: 25, height: 25, right: 5 + 5 },]}
            source={require('./checkmark.png')}
          />
        ) : null}
        {
          item.node.type === 'video/mp4' ? (
            <View style={{ paddingHorizontal: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: imageSize * 0.2, width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', top: imageSize - imageSize * 0.2, left: 0 }}>
              <Image source={require('./camera-video.png')} style={{ width: 20, height: 20 }} />
              <Text style={{ color: 'white' }}>{item.node.image.playableDuration}</Text>
            </View>
          ) : null
        }
      </TouchableOpacity>
    )
  }

  onCallbackItem() {
    alert(this.state.selectedUriItem)
  }


  //assets-library://asset/asset.MP4?id=326C6EC1-ADA4-438B-B4FA-235C6D61BA9F&ext=MP4
  render() {
    const { arrVideos, arrPhotos, item } = this.state
    var arrMedia = _.orderBy(_.concat(arrPhotos, arrVideos), 'node.timestamp')
    Reactotron.log('ddd')
    Reactotron.log(arrMedia)
    return (
      <View style={styles.container}>
        <Button
          onPress={() => this.onPicker()}
          title="Learn More"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
        <Button
          onPress={() => this.onCallbackItem()}
          title="Upload"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: 40, paddingHorizontal: 10 }}>
          <View style={{ flex: 1 }}>
            {item ? (
              <TouchableOpacity onPress={() => this.setState({ item: null, selectedUriItem: null })}>
                <Text>Cancel</Text>
              </TouchableOpacity>
            ) : <View />
            }
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Select Items</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            {item ? (
              <TouchableOpacity>
                <Text>Done</Text>
              </TouchableOpacity>
            ) : <View />
            }
          </View>
        </View>
        {/* <Image source={{ uri: 'assets-library://asset/asset.MP4?id=326C6EC1-ADA4-438B-B4FA-235C6D61BA9F&ext=MP4' }}
          style={{ height: 200, width: 200 }} /> */}
        {/* <Image source={{ uri: 'file:///storage/emulated/0/thumb/thumb-097e70be-ab48-4996-878f-04d82c58cb5d.jpeg' }}
          style={{
            width: 300,
            height: 300,
          }} /> */}
        <View style={{ paddingLeft: 5 }}>
          <FlatList
            data={arrMedia}
            renderItem={({ item }) => this.renderItem(item)}
            keyExtractor={(item, index) => item.node.timestamp.toString()}
            numColumns={3}
          />
        </View>
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
