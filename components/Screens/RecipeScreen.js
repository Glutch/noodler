import React from 'react'
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import { MediaLibrary, Permissions, KeepAwake } from 'expo'
import { Platform } from 'react-native'

import db from '../db'

const Star = ({ filled }) => {
  return filled
    ? <Image source={require(`../../assets/icons/star.png`)} style={{ width: 20, height: 20, marginRight: 5 }} />
    : <Image source={require(`../../assets/icons/star_gray.png`)} style={{ width: 20, height: 20, marginRight: 5 }} />
}

const Skeleton = () =>
  <ScrollView style={styles.scrollBox}>
    <TouchableOpacity style={styles.makePublic}>
      <Text style={styles.makePublicText}></Text>
    </TouchableOpacity>

    <View style={styles.imageBox}></View>

    <View style={styles.informationBox}>
      <Text style={styles.name}>hello</Text>
      <Text style={styles.text}>nice</Text>
    </View>

    <TouchableOpacity style={styles.deleteBtn}>
      <Text style={styles.deleteText}>Delete tasty recipe</Text>
    </TouchableOpacity>

  </ScrollView>


export default class RecipeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  state = {
    _id: '',
    name: '',
    text: '',
    score: 5,
    image: undefined,
    isPublic: false,
  }

  navigate = (to, obj) => this.props.navigation.push(to, obj)

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)

    const _id = this.props.navigation.getParam('_id', undefined)
    const toplist = this.props.navigation.getParam('toplist', false)

    toplist
      ? fetch(`http://92.35.43.129:4000/recipe/get?_id=${_id}`)
          .then(res => res.json())
          .then(res => {
            this.setState({ ...res.recipe, toplist })
          })
      : db.findOne({ _id }, (err, recipe) => {
          this.setState({ ...recipe, toplist })
        })
  }

  savePublicRecipeToLocalDb = () => {
    const { name, text, score, image } = this.state

    const recipe = {
      type: 'recipe',
      name,
      text,
      score,
      image,
      date: new Date(),
    }

    Alert.alert(`Save ${name}?`, '', [
      { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
      { text: 'Save', onPress: () => {
        db.insert(recipe, (err, res) => {
          this.props.navigation.push('Home')
          console.log('recipe saved')
        })
      }},
    ]
  )
  }

  uploadRecipe = () => {
    const { _id, name, text, score, image, date } = this.state
    let fileType = image.substring(image.lastIndexOf('.') + 1)

    let formData = new FormData()

    formData.append('image', {
      uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
      name: 'server renames this anyway',
      type: `image/${fileType}`
    })

    formData.append('_id', _id)
    formData.append('name', name)
    formData.append('text', text)
    formData.append('score', score)
    formData.append('date', date)

    const options = {
      method: 'POST',
      mode: 'cors',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    }

    fetch('http://92.35.43.129:4000/recipe/upload', options)
      .then(res => res.json())
      .then(res => res)
      .catch(err => err)
      .then(res => {
        this.updatePublicStatusLocally(true)
        console.log('success')
      })
  }

  // deletes the current recipe from our local database
  delete = () => {
    const { _id, name, isPublic } = this.state
    const removeMessage = isPublic ? 'This also removes the recipe from the public list.' : ''
    Alert.alert(`Delete ${name}?`, removeMessage, [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        { text: 'Delete', onPress: () => {
            db.remove({ _id })
            this.removeRecipeFromServer()
            this.props.navigation.push('Home')
        }},
      ]
    )
  }

  removeRecipeFromServer = async() => {
    const { _id } = this.state
    let res = await fetch(`http://92.35.43.129:4000/recipe/delete?_id=${_id}`)
    let json = await res.json()
    this.updatePublicStatusLocally(false)
    console.log(json)
  }

  // Updates our local recipe publicity status
  updatePublicStatusLocally = isPublic => {
    const { _id } = this.state
    db.update({ _id }, { $set: { isPublic } }, {}, (err, numReplaced) => {
      this.setState({ isPublic })
      console.log('updated publicity locally to', isPublic)
    })
  }

  updatePublicStatus = () => {
    const { isPublic, name } = this.state
    if (isPublic) {
      Alert.alert(`Remove`, `Remove ${name} from the public list?`, [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'Remove', onPress: () => this.removeRecipeFromServer() }
      ])
    } else {
      Alert.alert(`Publish`, `Publish ${name} to the public list?`, [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'Publish', onPress: () => this.uploadRecipe() }
      ])
    }
  }

  saveBtnMessage = () => this.state.toplist
    ? 'Save Recipe'
    : this.state.isPublic
      ? 'Unpublish'
      : 'Make Public'

  editRecipe = () => this.navigate('Create', { _id: this.state._id, edit: true })

  editBtn = () => {
    const { _id, isPublic, toplist } = this.state
    return (
      toplist
        ? <View></View>
        : <TouchableOpacity style={styles.editBtn} onPress={() => this.editRecipe()}>
        <Text style={styles.makePublicText}>Edit</Text>
      </TouchableOpacity>
    )
  }

  render() {
    const { _id, name, text, score, image, isPublic, toplist } = this.state
    const imageSrc = image && image.length > 45 ? image : `http://92.35.43.129:4000/images/${image}`
    if (!_id) { return <Skeleton /> } // no _id = no recipe loaded yet. show skeleton template
    return (
      <ScrollView style={styles.scrollBox}>
        <KeepAwake />

        {this.editBtn()}

        <TouchableOpacity style={styles.makePublic} onPress={() => toplist ? this.savePublicRecipeToLocalDb() : this.updatePublicStatus()}>
          <Text style={styles.makePublicText}>{this.saveBtnMessage()}</Text>
        </TouchableOpacity>

        {image && <View style={styles.imageBox}><Image source={{ uri: imageSrc }} style={styles.image}></Image></View>}

        <View style={styles.informationBox}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.score}>
            <Star filled={score > 0} />
            <Star filled={score > 1} />
            <Star filled={score > 2} />
            <Star filled={score > 3} />
            <Star filled={score > 4} />
          </View>
          <Text style={styles.text}>{text}</Text>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => this.delete()}>
          <Text style={styles.deleteText}>Delete {name}</Text>
        </TouchableOpacity>

      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  scrollBox: {
    flex: 1,
    backgroundColor: '#eee',
    paddingTop: 0,
  },
  mustard: {
    backgroundColor: '#F8A927',
    flex: 1
  },
  makePublic: {
    position: 'absolute',
    zIndex: 2,
    top: 20,
    right: 20,
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 50,
    elevation: 10,
    minWidth: 100
  },
  editBtn: {
    position: 'absolute',
    zIndex: 2,
    top: 20,
    left: 20,
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 50,
    elevation: 10,
    minWidth: 40
  },
  makePublicText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  informationBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: -50,
    marginLeft: 25,
    marginRight: 25,
    minHeight: 300
  },
  score: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingBottom: 20
  },
  name: {
    padding: 20,
    paddingBottom: 5,
    fontSize: 24,
    fontWeight: 'bold',
    width: '100%',
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 400,
    width: '100%',
  },
  imageBox: {
    backgroundColor: '#F8A927',
    height: 400,
    overflow: 'hidden'
  },
  text: {
    padding: 20,
    fontSize: 18,
    color: '#777',
  },
  deleteBtn: {
    height: 100,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteText: {
    color: '#B6335D',
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center'
  }
})
