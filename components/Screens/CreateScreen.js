import React from 'react'
import { Platform } from 'react-native'
import { ImagePicker } from 'expo'
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Image } from 'react-native'
import db from '../db'

export default class CreateRecipeScreen extends React.Component {
  static navigationOptions = {
    title: 'New Recipe',
  }

  state = {
    name: '',
    text: `1 tbsp Banana
3 tbsp Cake

1. Mix it up
2. Pour into bowl
3. Enjoy!`,
    score: 0,
    image: null,
    imageFromCamera: false
  }

  componentDidMount() {
    this.setState({
      name: this.generateName(),
      score: Math.floor(Math.random() * 5 | 0)
    })
  }

  componentDidUpdate() {
    this.updateImage()
  }

  updateImage = () => {
    // checks if navigation.param.image is updated, if so - update state
    const image = this.props.navigation.getParam('image', null) // get imageObject from navigation props (if there is one)
    image != this.state.image && this.setState({ image })
  }

  browseImages = async() => {
    const image = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'Images' })
    const { cancelled } = image
    if (!cancelled) { // checks if the user actually selected an image
      this.props.navigation.setParams({ image }) // updates navigation param image to new uri
    }
  }

  generateName = () => {
    // randomly generate an amusing recipe title
    const pre = ['Pretty', 'Very', 'Kinda', 'Relatively', 'Boring', 'Tasty']
    const middle = ['Blue', 'Green', 'Lovely', 'Amazing', 'Normal', 'Unusual', 'Funky', 'Smelly']
    const names = ['Soup', 'Cake', 'Curry', 'Potato', 'Brownie', 'Bread', 'Pancake']

    return `${pre[Math.floor(Math.random() * pre.length | 0)]} ${middle[Math.floor(Math.random() * middle.length | 0)]} ${names[Math.floor(Math.random() * names.length | 0)]}`
  }

  saveRecipe = () => {
    const { name, text, score, image } = this.state
    const recipe = {
      type: 'recipe',
      name,
      text,
      score,
      image: image.uri,
      isPublic: false,
      date: new Date(),
    }

    db.insert(recipe, (err, res) => {
      this.props.navigation.push('Home')
      console.log(res)
    })

    // this.uploadRecipe(recipe)
  }

  render() {
    const { navigation } = this.props
    const { name, score, text, image } = this.state
    console.log('image', image)
    return (
      <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={65} behavior='padding' enabled>
        <ScrollView style={styles.scrollBox}>
          <TouchableOpacity onPress={() => navigation.navigate('Camera')} style={styles.imageContainer}>
            {
              image
                ? <View style={styles.imageBox}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                </View>
                : <View style={styles.imageBox}>
                  <Image source={require('../../assets/icons/camera.png')} style={{ width: 64, height: 64 }} />
                  <Text>Take a picture</Text>
                </View>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.browseImages()} style={styles.imageContainer}>
            {
              image
                ? <View style={styles.imageBox}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                </View>
                : <View style={styles.imageBox}>
                  <Text>Browse</Text>
                </View>
            }
          </TouchableOpacity>
          

          <View style={styles.informationBox}>
            <View style={styles.nameAndScore}>
              <TextInput
                value={name}
                style={styles.name}
                onChangeText={name => this.setState({ name })}
                placeholder='Name'
                underlineColorAndroid='transparent'
              >
              </TextInput>
              <TextInput
                style={styles.score}
                keyboardType='numeric'
                maxLength={1}
                onChangeText={score => this.setState({ score })}
                placeholder='5/5'
                underlineColorAndroid='transparent'
              >
              </TextInput>
            </View>

            <TextInput
              value={text}
              style={styles.text}
              multiline={true}
              onChangeText={text => this.setState({ text })}
              placeholder={'Text'}
              underlineColorAndroid='transparent'
            >
            </TextInput>
          </View>

          <TouchableOpacity
            style={styles.addRecipeBtn}
            onPress={() => this.saveRecipe()}
          >
            <Text style={styles.addRecipeBtnText}>Save {name}!</Text>
          </TouchableOpacity>

          <View style={{ height: 60 }}></View>

        </ScrollView>

      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollBox: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 20,
  },
  nameAndScore: {
    flexDirection: 'row',
    borderRadius: 6,
  },
  informationBox: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderRadius: 6,
    marginTop: 15
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  imageBox: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    width: '100%',
    backgroundColor: '#ddd',
    overflow: 'hidden',
    borderRadius: 6,
  },
  image: {
    height: 300,
    width: '100%',
  },
  name: {
    padding: 20,
    fontSize: 24,
    width: '80%'
  },
  score: {
    paddingTop: 20,
    paddingBottom: 20,
    width: '20%',
    fontSize: 24,
    flexShrink: 0,
  },
  text: {
    padding: 20,
    paddingTop: 0,
    fontSize: 18,
    color: '#777',
  },
  addRecipeBtn: {
    marginTop: 15,
    height: 80,
    borderRadius: 6,
    width: '100%',
    backgroundColor: '#79C98B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addRecipeBtnText: {
    color: '#000',
    fontSize: 16
  },
})
