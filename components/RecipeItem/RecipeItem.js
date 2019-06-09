import React from 'react'
import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native'

import config from '../../config'

export default class RecipeItem extends React.Component {
  render() {
    const { recipe, toplist } = this.props
    const { _id, name, image, score } = recipe
    const imageSrc = image && image.length > 45 ? image : `${config.devIp}/images/${image}`
    return (
      <TouchableOpacity
        style={styles.recipe}
        onPress={() => {
          this.props.navigate('Recipe', { _id, toplist })
        }}>
          {
            image
              ? <View style={styles.imageBox}><Image source={{ uri: imageSrc }} style={styles.image}></Image></View>
              : <View style={styles.noImage}><Text>No image</Text></View>
          }
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
    shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: '#000',
    shadowOffset: { height: 0, width: 0 },
    elevation: 10,
    marginBottom: 25
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
    height: 300,
    width: '100%',
    borderRadius: 6,
  },
  noImage: {
    backgroundColor: '#ddd',
    height: 200,
    width: '100%',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex'
  },
})
