import React from 'react'
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native'
import { LinearGradient } from 'expo'

export default class RecipeItem extends React.Component {

  render() {
    const { recipe } = this.props
    const { _id, name, image } = recipe
    return (
      <TouchableOpacity
        style={styles.recipe}
        onPress={() => {
          this.props.navigate('Recipe', { _id, name })
        }}>
        <View>
          {
            image
              ? <View style={styles.imageBox}><Image source={{ uri: image }} style={styles.image}></Image></View>
              : <View style={styles.noImage}></View>
          }
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            start={[0, 1]}
            end={[1, 1]}
            style={{
              position: 'absolute',
              padding: 15,
              height: 150,
            }}
          ><Text style={styles.name}>{name}</Text></LinearGradient>

        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  name: {
    fontSize: 20,
    color: '#fff'
  },
  black: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 150,
    // padding: 15
  },
  recipe: {
    backgroundColor: '#fff',
    // borderRadius: 6,
    height: 150,
    width: '100%',
    justifyContent: 'center',
    // marginTop: 15
  },
  imageBox: {
    backgroundColor: '#eee',
    // borderRadius: 6,
    overflow: 'hidden'
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    width: '100%',
  },
  noImage: {
    backgroundColor: '#333',
    height: 150,
    width: '100%',
    //borderRadius: 6,
  },
})
