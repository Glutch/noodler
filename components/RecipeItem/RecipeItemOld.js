import React from 'react'
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native'
import { LinearGradient } from 'expo'

const Star = props => {
  return props.filled
    ? <Image source={require(`../../assets/icons/star.png`)} style={{ width: 20, height: 20, marginRight: 5 }} />
    : <Image source={require(`../../assets/icons/star_gray.png`)} style={{ width: 20, height: 20, marginRight: 5 }} />
}

export default class RecipeItem extends React.Component {

  render() {
    const { recipe, toplist } = this.props
    const { _id, name, image, score } = recipe
    return (
      <TouchableOpacity
        style={styles.recipe}
        onPress={() => {
          this.props.navigate('Recipe', { _id, name, toplist, image })
        }}>
        <View>
          <View style={styles.textBox}><Text style={styles.name}>{name}</Text></View>
          <View style={styles.score}>
            <Star filled={score > 0} />
            <Star filled={score > 1} />
            <Star filled={score > 2} />
            <Star filled={score > 3} />
            <Star filled={score > 4} />
          </View>
          {
            image
              ? <View style={styles.imageBox}><Image source={{ uri: toplist ? `http://92.35.43.129:4000/images/${image}` : image }} style={styles.image}></Image></View>
              : <View style={styles.noImage}></View>
          }
        </View>

      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  recipe: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    justifyContent: 'center',
    marginBottom: 25,
    padding: 15
  },
  score: {
    flexDirection: 'row',
    paddingLeft: 5,
    paddingBottom: 15
  },
  textBox: {
    justifyContent: 'center',
    paddingBottom: 5,
    paddingLeft: 5
  },
  name: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold'
  },
  imageBox: {
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden'
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: '100%',
    borderRadius: 6,
  },
  noImage: {
    backgroundColor: '#ddd',
    height: 200,
    width: '100%',
    borderRadius: 6,
  },
})
