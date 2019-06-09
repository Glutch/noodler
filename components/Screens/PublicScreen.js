import React from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'

import config from '../../config'

import RecipeItem from '../RecipeItem/RecipeItem'
import Header from '../Header/Header'

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null, //hides the default header, i have my own <Header>
  }

  state = {
    recipes: [], //object that will be filled with recipes from the server
  }

  fetchToplist = () => {
    fetch(`${config.devIp}/recipe/top`)
      .then(res => res.json())
      .then(res => {
        this.setState({ recipes: res.recipes })
      })
      .catch(error => {
        console.log(error)
      })
  }

  componentDidMount() {
    // as soon as the component mounts, we fetch recipes from our server
    this.fetchToplist()
  }

  navigate = (to, obj) => this.props.navigation.push(to, obj) //makes the navigation cleaner

  render() {
    const { recipes } = this.state
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Header navigate={this.navigate} screen={'public'}/>
          <View style={styles.recipes}>
            {recipes.map((recipe, i) => <RecipeItem key={i} recipe={recipe} toplist={true} navigate={this.navigate} />)}
          </View>
        </ScrollView>
        <TouchableOpacity
          style={styles.newRecipeBtn}
          onPress={() => this.props.navigation.navigate('Create')}
        >
          <Text style={styles.newRecipeBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8A927',
  },
  scrollView: {
    flex: 1
  },
  header: {
    height: 140,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40
  },
  info: {
    backgroundColor: '#F8A927',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    flexDirection: 'row',
  },
  infoThing: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100
  },
  big: {
    fontSize: 30,
  },
  small: { fontSize: 12 },
  recipes: {
    flex: 1,
    padding: 25
  },
  newRecipeBtn: {
    height: 60,
    width: 60,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderRadius: 100,
    bottom: 20,
    right: 20
  },
  newRecipeBtnText: {
    color: '#fff',
    fontSize: 30
  },
})
