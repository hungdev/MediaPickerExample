/**
 * Written by hung vu
 * https://github.com/hungdev
 * @flow
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types'
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

export default class MediaHelper extends Component<{}> {
  constructor(props) {
    super(props)
    this.state = {
      media: [],
      arrVideos: [],
      arrPhotos: []
    }
  }
  
  componentWillMount() {
    const {getPhotos, getVideos} = this.props
    // getPhotos ? this.getMedia('Photos', this.props.numPhotos): null
    // getVideos ? this.getMedia('Videos', this.props.numVideos) : null
    Platform.OS === 'ios' ? this.getIosMedia () : this.getAndroidMedia ()
  }

  onPicker() {
    const {getPhotos, getVideos} = this.props
    // getPhotos ? this.getMedia('Photos', this.props.numPhotos): null
    // getVideos ? this.getMedia('Videos', this.props.numVideos) : null
  }

  getAndroidMedia () {
    const {getPhotos, getVideos} = this.props
    getPhotos ? this.onAndroidGetMedia('Photos', this.props.numPhotos): null
    getVideos ? this.onAndroidGetMedia('Videos', this.props.numVideos) : null
  }

  onAndroidGetMedia(media, num) {
    CameraRoll.getPhotos({
      first: num,
      assetType: media,
    })
      .then(r => {
        if (media === 'Photos') {
          var arrPhotos = _.map(r.edges, e => {
            e.node.image.thumbnailUrl = e.node.image.uri
            return e
          })
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
        alert('Error Loading Images')
      })
  }

  getIosMedia () {
    const {media, num} = this.props
    CameraRoll.getPhotos({
      first: num,
      assetType: media,
    })
    .then(r => {
      // this.setState({ photos: r.edges });
      var arrMedia = _.map(r.edges, e => {
        e.node.image.thumbnailUrl = e.node.image.uri
        return e
      })
      this.setState({ arrMedia })
    })
    .catch((err) => {
       //Error Loading Images
    });
  }

  onSelected(item) {
    const { onSelected } = this.props
    this.setState({ selectedUriItem: item.node.image.uri, item: item })
    onSelected ? onSelected(item) : null
  }

  renderItem(item) {
    const { imagesPerRow, imageMargin } = this.props
    var imageSize = ((width - (imagesPerRow + 1) * imageMargin) / imagesPerRow)

    Reactotron.log('iiiiiiiii')
    Reactotron.log(item)
    return (
      <TouchableOpacity onPress={() => this.onSelected(item)} style={{ marginBottom: imageMargin, marginRight: imageMargin, height: imageSize, width: imageSize }}>
        <Image
          source={{ uri: item.node.image.thumbnailUrl }}
          style={{
            width: imageSize,
            height: imageSize,
          }}
        />
        {this.state.selectedUriItem === item.node.image.uri ? (
          <Image
            style={[styles.checkIcon, { width: 25, height: 25, right: imageMargin + 5 }]}
            source={require('./checkmark.png')}
          />
        ) : null}
        {
          item.node.type === 'video/mp4' ? (
            <View style={[styles.rowInfoVideo, { height: imageSize * 0.2, top: imageSize - imageSize * 0.2 }]}>
              <Image source={require('./camera-video.png')} style={{ width: 20, height: 20 }} />
              <Text style={{ color: 'white' }}>{item.node.image.playableDuration}</Text>
            </View>
          ) : null
        }
      </TouchableOpacity>
    )
  }

  onSelectedItem() {
    const { item } = this.state
    this.props.onSelectedItem(item)
  }

  render() {
    const { arrVideos, arrPhotos, item, arrMedia } = this.state
    const { imageMargin, imagesPerRow } = this.props

    var dataMedia = Platform.OS === 'ios' ? arrMedia : _.orderBy(_.concat(arrPhotos, arrVideos), 'node.timestamp').reverse()

    return (
      <View style={styles.container}>
        <View style={styles.warpHeader}>
          <View style={{ flex: 1 }}>
            {item ? (
              <TouchableOpacity onPress={() => this.setState({ item: null, selectedUriItem: null })}>
                <Text style={styles.txtStyle}>Cancel</Text>
              </TouchableOpacity>
            ) : <View />
            }
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.txtStyle}>Select Items</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            {item ? (
              <TouchableOpacity onPress={() => this.onSelectedItem()} >
                <Text style={styles.txtStyle}>Done</Text>
              </TouchableOpacity>
            ) : <View />
            }
          </View>
        </View>
        <View style={{ paddingLeft: imageMargin }}>
          <FlatList
            data={dataMedia}
            renderItem={({ item }) => this.renderItem(item)}
            keyExtractor={(item, index) => item.node.timestamp.toString()}
            numColumns={imagesPerRow}
          />
        </View>
      </View>
    );
  }
}

MediaHelper.defaultProps = {
  imageMargin: 5,
  imagesPerRow: 3,
  numPhotos: 10,
  numVideos: 10,
  getPhotos: true,
  getVideos: true,
  media: Platform.OS === 'ios' ? 'All' : 'Photos',
  num: 20
}

MediaHelper.propTypes = {
  getPhotos: PropTypes.bool,
  getVideos: PropTypes.bool,
  numPhotos: PropTypes.number,
  numVideos: PropTypes.number,
  imageMargin: PropTypes.number,
  imagesPerRow: PropTypes.number,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  checkIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'transparent',
  },
  warpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 40,
    paddingHorizontal: 10
  },
  rowInfoVideo: {
    paddingHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    left: 0
  },
  txtStyle: {
    color: 'blue'
  }
});
