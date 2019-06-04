import React from 'react'
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'

export default class PublicScreen extends React.Component {
  render() {
    const currentScreen = this.props.screen
    const home = currentScreen == 'home'
    return (
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => this.props.navigate('Home')}>
          <Text style={home ? styles.linkTextBold : styles.linkText}>YOUR NOODLES</Text>
        </TouchableOpacity>
        <View style={styles.divider}></View>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => this.props.navigate('Public')}>
          <Text style={home ? styles.linkText : styles.linkTextBold}>THEIR NOODLES</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    backgroundColor: '#ED9D19',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  linkButton: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Roboto',
    color: '#FFCB75'
  },
  linkTextBold: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    color: '#fff'
  },
  divider: {
    height: 32,
    width: 1,
    backgroundColor: '#fff'
  }
})
