import React from 'react'
import { Platform } from 'react-native'
import { ImagePicker } from 'expo'
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Image } from 'react-native'
import db from '../db'

export default class CreateRecipeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  state = {
    name: '',
    text: `1 tbsp soy sauce
3 tbsp happy noodle

1. Cook noodle
2. Eat noodle
3. Enjoy!`,
    score: 0,
    image: null,
  }

  componentDidMount() {
    const edit = this.props.navigation.getParam('edit', false)
    edit
      ? this.editMode()
      : this.normalMode()
  }

  editMode = () => {
    const _id = this.props.navigation.getParam('_id', undefined)
    db.findOne({ _id }, (err, recipe) => {
      this.setState({ ...recipe, edit: true })
      console.log(recipe)
    })
  }

  normalMode = () => {
    this.setState({
      name: this.generateName(),
      score: Math.floor(Math.random() * 5 | 0)
    })
  }

  componentDidUpdate() {
    this.updateImage()
  }

  resetImageState = () => {
    this.props.navigation.setParams({ image: null })
    this.setState({ image: null })
  }

  updateImage = () => {
    // checks if navigation.param.image is updated, if so - update state
    const image = this.props.navigation.getParam('image', null) // get imageObject from navigation props (if there is one)
    image && image != this.state.image && this.setState({ image })
  }

  browseImages = async() => {
    const image = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'Images' })
    const { cancelled, uri } = image
    if (!cancelled) { // checks if the user actually selected an image
      this.props.navigation.setParams({ image: uri }) // updates navigation param image to new uri
    }
  }

  generateName = () => {
    // randomly generate an amusing recipe title
    const pre = ['Pretty', 'Very', 'Kinda', 'Relatively', 'Boring', 'Tasty']
    const middle = ['Blue', 'Green', 'Lovely', 'Amazing', 'Normal', 'Unusual', 'Funky', 'Smelly']
    const names = ['Soup', 'Cake', 'Curry', 'Potato', 'Brownie', 'Bread', 'Pancake']

    return `${pre[Math.floor(Math.random() * pre.length | 0)]} ${middle[Math.floor(Math.random() * middle.length | 0)]} ${names[Math.floor(Math.random() * names.length | 0)]}`
  }

  save = () => {
    const { edit } = this.state
    edit
      ? this.saveEdit()
      : this.saveRecipe()
  }

  saveRecipe = () => {
    const { name, text, score, image } = this.state
    const recipe = {
      type: 'recipe',
      name,
      text,
      score,
      image,
      isPublic: false,
      date: new Date(),
    }

    db.insert(recipe, (err, res) => {
      this.props.navigation.push('Home')
      console.log(res)
    })
  }

  saveEdit = () => {
    const { _id, name, text, score, image } = this.state
    db.update({ _id }, { $set: { name, text, score, image } }, {}, () => {
      console.log('recipe updated')
      this.props.navigation.push('Recipe', { _id })
    })
  }

  render() {
    const { navigation } = this.props
    const { name, score, text, image } = this.state
    console.log('image', image)
    return (
      <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={65} behavior='padding' enabled>
        <ScrollView style={styles.scrollBox}>
          
          {
          image
            ? <TouchableOpacity onPress={() => this.resetImageState()}>
                <View style={styles.imageBox}>
                  <Image source={{ uri: image }} style={styles.image} />
                </View>
              </TouchableOpacity>
            : <View>
              <TouchableOpacity onPress={() => navigation.navigate('Camera')} style={styles.imageContainer}>
                <View style={styles.takePictureBox}>
                  <Image source={require('../../assets/icons/camera.png')} style={{ width: 64, height: 64 }} />
                  <Text>Take a picture</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => this.browseImages()} style={styles.imageContainer}>
              <View style={styles.browseBox}>
                  <Image source={require('../../assets/icons/folder.png')} style={{ width: 64, height: 64 }} />
                  <Text>Browse</Text>
                </View>
              </TouchableOpacity>
            </View>
          }


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
            onPress={() => this.save()}
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
  takePictureBox: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
    width: '100%',
    backgroundColor: '#ddd',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  browseBox: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
    width: '100%',
    backgroundColor: '#ddd',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
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
