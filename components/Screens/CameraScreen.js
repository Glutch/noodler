import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, CameraRoll, Dimensions, Platform, StatusBar } from 'react-native'
import { Camera, Permissions, FileSystem, MediaLibrary } from 'expo'

const DESIRED_RATIO = '16:9'

export default class CameraScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  state = {
    hasCameraPermission: null,
    hasCameraRollPermission: null,
    type: Camera.Constants.Type.back,
    ratio: null,
    offset: null,
  }

  async componentWillMount() {
    this.calculateOffset()
    this.getCameraPermission()
    this.getCameraRollPermission()
  }

  calculateOffset = () => {
    const { height, width } = Dimensions.get('window')
    const newWidth = height * (3 / 4)
    const widthOffset = -((newWidth - width) / 2)
    this.setState({ offset: widthOffset })
  }

  getCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({ hasCameraPermission: status === 'granted' })
  }

  getCameraRollPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
    this.setState({ hasCameraRollPermission: status === 'granted' })
  }

  takePicture = async () => {
    if (this.camera) {
      const { uri } = await this.camera.takePictureAsync()
      const asset = await MediaLibrary.createAssetAsync(uri)
      this.props.navigation.navigate('Create', { image: asset.uri })
    }
  }

  prepareRatio = async () => {
    if (Platform.OS === 'android' && this.camera) {
      const ratios = await this.camera.getSupportedRatiosAsync();

      // See if the current device has your desired ratio, otherwise get the maximum supported one
      // Usually the last element of "ratios" is the maximum supported ratio
      const ratio = ratios.find((ratio) => ratio === DESIRED_RATIO) || ratios[ratios.length - 1];

      this.setState({ ratio });
    }
  }

  render() {
    const { hasCameraPermission, ratio, type } = this.state
    if (hasCameraPermission === null) {
      return <View />
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>
    } else {
      return (
        <View style={styles.container}>
          <StatusBar hidden={true} />
          <Camera
            onCameraReady={this.prepareRatio}
            type={type}
            ref={ref => this.camera = ref}
            ratio={ratio}
            style={{ flex: 1 }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}>
              <TouchableOpacity onPress={this.takePicture} style={styles.snap}></TouchableOpacity>
            </View>
          </Camera>
          <View style={styles.captureBoxContainer}><View style={styles.captureBox}></View></View>
        </View>
      )
    }
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  captureBoxContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  captureBox: {
    width: '100%',
    height: 400,
    borderWidth: 2,
    borderColor: '#fff',
  },
  snap: {
    position: 'absolute',
    left: '50%',
    marginLeft: -40,
    bottom: 50,
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: 'white',
  }
})
