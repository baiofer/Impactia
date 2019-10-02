//React imports
import React, {Component} from 'react';
//React Native imports
import { StyleSheet, View, Text } from 'react-native';
//Components imports
import SignIn from './scenes/SignIn';
import Register from './scenes/Register'
import ReadCounter from './scenes/ReadCounter'
import TabIcon from './components/TabIcon'
import MyMouvements from './scenes/MyMouvements'
import Adjust from './scenes/Adjust'
//React Native Router Flux imports
import { Actions, Router, Scene } from 'react-native-router-flux'
//Icons imports
import Icon from 'react-native-vector-icons/FontAwesome';
//Firebase imports
import firebaseConfig from './utils/firebase'
//import * as firebase from 'firebase'
import firebase from '@firebase/app'
import '@firebase/auth'
firebase.initializeApp(firebaseConfig)


export default class App extends Component {

  renderTitle(title) {
    return(
      <View style={ styles.titleNav }>
        <Text style={ styles.title }>{ title }</Text>
        {/*
        <Text style={ styles.subtitle }>{ this.state.userLogged }</Text>
        */}
      </View>
    )
  }

  render() {
    return (
      <Router> 
        <Scene key='root'>
          <Scene
            key={ 'SignIn' }
            component={ SignIn }
            navTransparent={ true }
            title='Iniciar sesión'
            titleStyle={ styles.title }
          />
          <Scene
            key={ 'Register' }
            component={ Register }
            navTransparent={ true }
            title='Registrarse'
            titleStyle={ styles.title }
          />
          <Scene
            key={ 'TabBar' }
            tabs={ true }
            hideNavBar={ false }
            tabBarStyle={ styles.tabBar }
            navTransparent={ true }
            default={ 'ReadCounter' }
            activeTintColor='grey'
            inactiveTintColor='#fff'
          >
            <Scene 
              key={'ReadCounter'}
              icon={ TabIcon }
              iconName='book-reader'
              colorIcon='#FE8000'
              component={ ReadCounter }
              renderTitle={ this.renderTitle('Leer Contador') }
              navigationBarStyle={ styles.navBar }
            />
            <Scene 
              key={'MyMouvements'}
              icon={ TabIcon }
              iconName='list'
              colorIcon='#FE8000'
              component={ MyMouvements }
              renderTitle={ this.renderTitle('Movimientos') }
              navigationBarStyle={ styles.navBar }
            />
            <Scene 
              key={'Adjust'}
              icon={ TabIcon }
              iconName='wrench'
              colorIcon='#FE8000'
              component={ Adjust }
              renderTitle={ this.renderTitle('Ajustes') }
              navigationBarStyle={ styles.navBar }
            />
          </Scene>
        </Scene>
      </Router> 
    );
  }
}

const styles = StyleSheet.create({
  title: {
    color: '#FE8000',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
