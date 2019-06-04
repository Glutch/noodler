import React from 'react'
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native'
import { MediaLibrary, Permissions } from 'expo'
import { Platform } from 'react-native'

import db from '../db'

const Star = ({ filled }) => {
  return filled
    ? <Image source={require(`../../assets/icons/star.png`)} style={{ width: 20, height: 20, marginRight: 5 }} />
    : <Image source={require(`../../assets/icons/star_gray.png`)} style={{ width: 20, height: 20, marginRight: 5 }} />
}


export default class RecipeScreen extends React.Component {
  // static navigationOptions = ({ navigation }) => {
  //   return {
  //     title: navigation.getParam('name', 'unnamed'),
  //   }
  // }

  static navigationOptions = {
    title: 'My Recipes',
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

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)

    const _id = this.props.navigation.getParam('_id', 'unnamed')
    const toplist = this.props.navigation.getParam('toplist', false)

    toplist
      ? fetch(`http://92.35.43.129:4000/recipe?_id=${_id}`)
          .then(res => res.json())
          .then(res => {
            console.log(res)
            this.setState({ ...res.recipe })
          })
      : db.findOne({ _id }, (err, recipe) => {
          this.setState({ ...recipe })
        })
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
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }

    fetch('http://92.35.43.129:4000/upload/recipe', options)
      .then(res => {
        console.log(res)
        return res.json()
      })
      .then(res => {
        console.log(res)
        console.log('upload success', res)
        this.setState({ isPublic: true })
        this.updatePublicStatusLocally(true)
      })
      .catch(error => {
        console.log('RÖVHÅL')
        console.log(error)
      })
      
  }

  delete = () => {
    db.remove({ _id: this.state._id })
    this.props.navigation.push('Home')
  }

  isEmpty = obj =>  {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false
    }
    return true
}

  isRecipeOnServer = async() => {
    const { _id } = this.state
    let res = await fetch(`http://92.35.43.129:4000/recipe?_id=${_id}`)
    let json = await res.json()
    const onServer = !this.isEmpty(json.recipe)
    console.log('onServer', onServer)
    return onServer
  }

  updatePublicStatusLocally = isPublic => {
    const { _id } = this.state
    db.update({ _id }, { isPublic}, {}, (err, numReplaced) => {
      console.log(numReplaced)
    })
  }

  updatePublicStatus = () => {
    const { _id, isPublic, image } = this.state
    this.isRecipeOnServer()
      .then(onServer => {
        if (onServer) {
          console.log('recipe is on server, lets update')
          fetch(`http://92.35.43.129:4000/updatePublicStatus?_id=${_id}&makePublic=${!isPublic}`)
            .then(res => res.json())
            .then(res => {
              console.log(res)
              this.setState({ isPublic: res.isPublic })
              this.updatePublicStatusLocally(isPublic)
            })
        } else {
          console.log('recipe is NOT on server, lets upload')
          this.uploadRecipe()
        }
      })
  }

  render() {
    const { _id, name, text, score, image, isPublic } = this.state
    const toplist = this.props.navigation.getParam('toplist', false)
    return (
      <ScrollView style={styles.scrollBox}>

        <TouchableOpacity style={styles.makePublic} onPress={() => this.updatePublicStatus()}>
          <Text style={styles.makePublicText}>{isPublic ? 'Unpublish' : 'Make Public'}</Text>
        </TouchableOpacity>

        {image && <View style={styles.imageBox}><Image source={{ uri: toplist ? `http://92.35.43.129:4000/images/${image}` : image }} style={styles.image}></Image></View>}

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
  makePublic: {
    position: 'absolute',
    zIndex: 2,
    top: 40,
    right: 15,
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 50,
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
    backgroundColor: '#eee',
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
