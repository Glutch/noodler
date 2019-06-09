import React from 'react'
import HomeScreen from './components/Screens/HomeScreen'
import CreateScreen from './components/Screens/CreateScreen'
import RecipeScreen from './components/Screens/RecipeScreen'
import CameraScreen from './components/Screens/CameraScreen'
import PublicScreen from './components/Screens/PublicScreen'
import { createStackNavigator, createAppContainer } from 'react-navigation'

// createStackNavigator creates the "root" object we use with react-navigation
// we define the name we will use to transition betweens creens
// the "navigation" function gets passed down to all child components defined here automatically
// for example to go to Home we use this.props.navigation.push('Home')
const AppNavigator = createStackNavigator({
    Home: HomeScreen,
    Create: CreateScreen,
    Recipe: RecipeScreen,
    Camera: CameraScreen,
    Public: PublicScreen,
  },
  {
    initialRouteName: 'Home', //screen to show on launch
  }
)

export default createAppContainer(AppNavigator)