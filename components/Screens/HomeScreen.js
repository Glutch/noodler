import React from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native'

import db from '../db'

import RecipeItem from '../RecipeItem/RecipeItem'
import Header from '../Header'

export default class PublicScreen extends React.Component {
  static navigationOptions = {
    header: null,
  }

  state = {
    recipes: [],
  }

  componentDidMount() {
    db.find({ type: 'recipe' }).sort({ date: -1 }).exec((err, res) => {
      this.setState({ recipes: res })
    })
  }

  navigate = (to, obj) => this.props.navigation.push(to, obj)

  render() {
    const { recipes } = this.state
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <ScrollView style={styles.scrollView}>
          <Header navigate={this.navigate} screen={'home'}/>
          <View style={styles.recipes}>
            {recipes.map((recipe, i) => <RecipeItem key={i} recipe={recipe} navigate={this.navigate} />)}
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
