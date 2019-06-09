import React from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import { KeepAwake } from 'expo'
import { Platform } from 'react-native'

import db from '../../db'
import config from '../../config'

//this component has the logic for the stars. Renders gray (not filled) or yellow (filled) stars
const Star = ({ filled }) => {
  return filled
    ? <Image source={require(`../../assets/icons/star.png`)} style={{ width: 20, height: 20, marginRight: 5 }} />
    : <Image source={require(`../../assets/icons/star_gray.png`)} style={{ width: 20, height: 20, marginRight: 5 }} />
}

//Until a recipe can be rendered, this skeleton will be shown. to make a nicer transition during recipe loads
const Skeleton = () =>
  <ScrollView style={styles.scrollBox}>
    <View style={styles.imageBox}></View>
    <View style={styles.informationBox}></View>
  </ScrollView>

export default class RecipeScreen extends React.Component {
  static navigationOptions = {
    header: null, //hides the default header, i use my own!
  }

  state = {
    _id: '',
    name: '',
    text: '',
    score: 5,
    image: undefined,
    views: undefined,
    saves: undefined,
    isPublic: false,
  }

  // shorter nicer navigate function
  navigate = (to, obj) => this.props.navigation.push(to, obj)

  async componentDidMount() {
    //when our recipescreen is mounted the first thing we do is check if the recipe is going to show
    //a private or public recipe. Then we fetch data from the corresponding location
    const _id = this.props.navigation.getParam('_id', undefined)
    const toplist = this.props.navigation.getParam('toplist', false)

    toplist
      ? fetch(`${config.devIp}/recipe/get?_id=${_id}`)
          .then(res => res.json())
          .then(res => {
            this.setState({ ...res.recipe, toplist })
          })
      : db.findOne({ _id }, (err, recipe) => {
          this.setState({ ...recipe, toplist })
        })
  }

  componentDidUpdate() {
    //every time our component updates we check if views & saves are undefined and if we are looking at
    //a private recipe that has been made public. If so, we want to grab the latest stats from the server
    const { toplist, isPublic, views, saves } = this.state
    if ((views == undefined || saves == undefined) && (!toplist && isPublic)) {
      this.getStatsIfLocal()
    }
  }

  //grabs the view & save stats from the server
  getStatsIfLocal = async() => {
    let { _id } = this.state
    const res = await fetch(`${config.devIp}/recipe/get?_id=${_id}`)
    const json = await res.json()
    if (json.recipe != 'not found') {
      const { views, saves } = json.recipe
      this.setState({ views, saves })
    }
  }

  //saves a recipe from the public list to our private database locally in the phone
  savePublicRecipeToLocalDb = () => {
    const { _id, name, text, score, image } = this.state

    const recipe = {
      type: 'recipe',
      name,
      text,
      score: 0,
      image,
      views: undefined,
      saves: undefined,
      date: new Date(),
    }

    // pops up an alert asking if the user wanna save the recipe or not
    Alert.alert(`Save ${name}?`, '', [
      { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
      { text: 'Save', onPress: () => {
        db.insert(recipe, (err, res) => {
          this.props.navigation.push('Home')
          console.log('recipe saved')
          fetch(`${config.devIp}/recipe/update?_id=${_id}`)
        })
      }},
    ])
  }

  // uploads a private recipe to the public list
  uploadRecipe = () => {
    const { _id, name, text, score, image, date } = this.state
    let fileType = image.substring(image.lastIndexOf('.') + 1) //grabs the image format of the pic (jpg, png etc) and appends it in the formdata

    let formData = new FormData()

    // creates the object that multer will interpret on the server
    formData.append('image', {
      uri: Platform.OS === 'android' ? image : image.replace('file://', ''), //on ios we need to remove 'file://' from the image url
      name: 'server renames this anyway', //server renames the image with uuid but a name is required in the request
      type: `image/${fileType}` // jpg or png etc, explained above
    })

    //appends all the recipe information
    formData.append('_id', _id)
    formData.append('name', name)
    formData.append('text', text)
    formData.append('score', score)
    formData.append('date', date)

    //brings it all together as a nice object ready to get sent with our post request
    const options = {
      method: 'POST',
      mode: 'cors',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    }

    fetch(`${config.devIp}/recipe/upload`, options)
      .then(res => res.json())
      .then(res => res)
      .catch(err => err)
      .then(res => {
        this.updatePublicStatusLocally(true) // we update our local db to indicate this recipe is now public and state to update the view
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
            this.removeRecipeFromServer() //always tries to remove from server even if isPublic = false. Just to make sure a recipe never bugs out and ends up on the public list but not locally
            this.props.navigation.push('Home')
        }},
      ]
    )
  }

  //tries to remove the recipe from the server
  removeRecipeFromServer = async() => {
    const { _id } = this.state
    let res = await fetch(`${config.devIp}/recipe/delete?_id=${_id}`)
    let json = await res.json()
    this.updatePublicStatusLocally(false) // we update our local db to indicate the new status of the recipe and state to update the view
  }

  // Updates our local recipe publicity status
  updatePublicStatusLocally = isPublic => {
    const { _id } = this.state
    db.update({ _id }, { $set: { isPublic } }, {}, (err, numReplaced) => {
      this.setState({ isPublic })
    })
  }

  // main function o handle the alerts for removing recipes
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

  // generates different names depending on if the recipe is public (or not) and if private-public
  saveBtnMessage = () => this.state.toplist
    ? 'Save Recipe'
    : this.state.isPublic
      ? 'Unpublish'
      : 'Make Public'

  // sends the user to the create screen where the user can update the recipe (edit: true)
  editRecipe = () => this.navigate('Create', { _id: this.state._id, edit: true })

  // if the recipe is private, the user should be able to edit the recipe. If not, do not show an edit btn (empty <View>)
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

  // simple function to render the views & saves
  renderPublicRecipeStats = () => {
    const { views, saves } = this.state
    return (
      <View style={styles.publicStats}>
        <Text style={styles.publicStat}>Views: {views}</Text>
        <Text style={styles.publicStat}>Saves: {saves}</Text>
      </View>
    )
  }

  // updates the score in local db when the user clicks on the stars
  updateScore = score => {
    const { _id } = this.state
    db.update({ _id }, { $set: { score } }, {}, (err, numReplaced) => {
      this.setState({ score })
    })
  }

  // function to render the score / stars of private recipes
  renderStars = () => {
    const { score } = this.state
    const elements = [1, 2, 3, 4, 5]
    const items = []

    for (const [index, value] of elements.entries()) {
      items.push(
        <TouchableOpacity key={index} onPress={() => this.updateScore(value)}>
          <Star filled={score > index} />
        </TouchableOpacity>
      )
    }
    return (
      <View style={styles.score}>
        {items}
      </View>
    )
  }

  renderDeleteBtn = () => {
    const { name } = this.state
    return (
      <TouchableOpacity style={styles.deleteBtn} onPress={() => this.delete()}>
        <Text style={styles.deleteText}>Delete {name}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    const { _id, name, text, score, image, isPublic, toplist } = this.state
    const imageSrc = image && image.length > 45 ? image : `http://92.35.43.129:25565/images/${image}` // this detects if the image url is coming from the server or locally
    if (!_id) { return <Skeleton /> } // no _id = no recipe loaded yet. show skeleton template
    return (
      <ScrollView style={styles.scrollBox}>
        <KeepAwake />
        {/* prevents the screen from ever turning off, nice for looking at recipes while cooking */}

        { this.editBtn() }

        <TouchableOpacity style={styles.makePublic} onPress={() => toplist ? this.savePublicRecipeToLocalDb() : this.updatePublicStatus()}>
          <Text style={styles.makePublicText}>{this.saveBtnMessage()}</Text>
        </TouchableOpacity>

        { image
          ? <View style={styles.imageBox}><Image source={{ uri: imageSrc }} style={styles.image}></Image></View>
          : <View style={styles.imageBox}><Text>No image. Edit to upload one</Text></View>
        }

        <View style={styles.informationBox}>
          <Text style={styles.name}>{name}</Text>
          { (toplist || isPublic) && this.renderPublicRecipeStats() }
          { (!toplist || isPublic) && this.renderStars() }
          <Text style={styles.text}>{text}</Text>
        </View>

        { !toplist && this.renderDeleteBtn() }

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
  publicStats: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 20
  },
  publicStat: {
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    marginRight: 10
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
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
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
