import React from 'react'
import HomeScreen from './components/Screens/HomeScreen'
import CreateScreen from './components/Screens/CreateScreen'
import RecipeScreen from './components/Screens/RecipeScreen'
import CameraScreen from './components/Screens/CameraScreen'
import PublicScreen from './components/Screens/PublicScreen'
import { createStackNavigator, createAppContainer } from 'react-navigation'

const AppNavigator = createStackNavigator({
    Home: HomeScreen,
    Create: CreateScreen,
    Recipe: RecipeScreen,
    Camera: CameraScreen,
    Public: PublicScreen,
  },
  {
    initialRouteName: 'Home',
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#F8A927',
        shadowOpacity: 0,
        elevation: 0,
        height: 80,
      },
      headerTintColor: '#000',
      headerTitleStyle: {
        fontWeight: 'bold',
        width: '100%'
      },
    },
  }
)

export default createAppContainer(AppNavigator)