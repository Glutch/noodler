import React from 'react'
import { ImagePicker } from 'expo'
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Image } from 'react-native'
import db from '../../db'

export default class CreateRecipeScreen extends React.Component {
  static navigationOptions = {
    header: null, //hides the default header, i have my own <Header>
  }

  state = { //default recipe configuration
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
    // checks if the user came here from the edit btn
    const edit = this.props.navigation.getParam('edit', false)
    edit
      ? this.editMode()
      : this.normalMode()
  }

  editMode = () => {
    // if the user came here to edit, we fill the inputs with the recipes information
    const _id = this.props.navigation.getParam('_id', undefined)
    db.findOne({ _id }, (err, recipe) => { //fetch recipe from local db and update state
      this.setState({ ...recipe, edit: true })
    })
  }

  normalMode = () => {
    // normal mode: generates a funny recipe name
    this.setState({
      name: this.generateName()
    })
  }

  componentDidUpdate() {
    this.updateImage()
  }

  resetImageState = () => {
    // if user wants to take / browse a new picture
    this.props.navigation.setParams({ image: null })
    this.setState({ image: null })
  }

  updateImage = () => {
    // checks if navigation.param.image is updated, if so - update state
    const image = this.props.navigation.getParam('image', null) // get imageObject from navigation props (if there is one)
    image && image != this.state.image && this.setState({ image }) // if image url is there and is different from state, use new image url
  }

  browseImages = async() => {
    // launches expo's image picker and looks for only images (not videos etc)
    const image = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'Images' })
    const { cancelled, uri } = image
    if (!cancelled) { // checks if the user actually selected an image
      this.props.navigation.setParams({ image: uri }) // updates navigation param image to new url (and componentDidUpdate, updateImage handles the change)
    }
  }

  generateName = () => {
    // randomly generates an amusing recipe title
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
    // if createscreen is in normal mode, save the recipe to our local db
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
    // if createscreen is in edit mode, update the recipe with new data
    const { _id, name, text, score, image } = this.state
    db.update({ _id }, { $set: { name, text, score, image } }, {}, () => {
      console.log('recipe updated')
      this.props.navigation.push('Home')
    })
  }

  render() {
    const { navigation } = this.props
    const { name, text, image } = this.state
    return (
      <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={-20} behavior='padding' enabled>
        {/* KeyboardAvoidingView makes the text come into better view when keyboard is showing */}
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
