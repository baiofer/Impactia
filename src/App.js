//React imports
import React, {Component} from 'react';
//React Native imports
import { StyleSheet, View, Text, Alert, YellowBox, TouchableOpacity } from 'react-native';
//Components imports
import SignIn from './scenes/signIn/Signin';
import Register from './scenes/signIn/Register'
import ReadCounter from './scenes/ReadCounter'
import TabIcon from './components/TabIcon'
import Preloader from './components/Preloader'
import MyMouvements from './scenes/MyMouvements'
import Adjust from './scenes/Adjust'
import Menu from './scenes/Menu'
//React Native Router Flux imports
import { Actions, Router, Scene, Tabs } from 'react-native-router-flux'
//Icons imports
import Icon from 'react-native-vector-icons/FontAwesome';
//Firebase imports
import firebaseConfig from './utils/firebase'
//import * as firebase from 'firebase'
import firebase from '@firebase/app'
import '@firebase/auth'
firebase.initializeApp(firebaseConfig)
//Utils imports
import * as Utils from './utils'


export default class App extends Component {

  constructor() {
    super()
    this.state = {
      isLogged: false,
      loaded: false,
      userLogged: '',
      userUid:'',
      systemToRead: '0',
    }
  }

  //LIVE CYCLE
  componentWillMount() {
    console.ignoredYellowBox = ['Remote debugger']
    YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated'])   
  }

  async componentDidMount() {
    await firebase.auth().onAuthStateChanged( (user) => {
      if (user !== null) {
        this.setState({
          isLogged: true,
          loaded: true,
          userLogged: user.email,
          userUid: user.uid
        })
      } else {
        this.setState({
          isLogged: false,
          loaded: true,
          userLogged: '',
          userUid: '',
        })
      }
      //Save userLogged & userUid
      console.log('Saving UserLogged, UserUid and BleIsConnect')
      Utils.PersistData.setUserLogged(this.state.userLogged)
      Utils.PersistData.setUserUid(this.state.userUid)
    })
    //Set module BLE not inicialized
    await Utils.PersistData.setBLEIsConnect('0')
    //Get systemToRead
    await Utils.PersistData.getSystemToRead()
    .then( (value) => {
      console.log('systemToRead in componentDiDMount: ', value)
      this.setState({
        systemToRead: value,
      })
    })
  }

  selectScene(value) {
    console.log('TabBarPressed: ', value)
  }

  renderTitle(title) {
    return(
      <View style={ styles.titleNav }>
        <Text style={ styles.title }>{ title }</Text>
      </View>
    )
  }

  renderMenuButton() {
    return (
      <TouchableOpacity 
        style={ styles.cartButton } 
        onPress={ () => Actions.Menu() }
      >
        <Icon 
          style={{ color: '#FE8000' }} 
          name="ellipsis-h"
          type='FontAwesome'
          size={ 25 }
        />
      </TouchableOpacity>
    )
  }

  //Access to SignIn. There isn't usserLogged ('')
  renderNavigation1() {
    return (
      <Router> 
        <Scene key='root'>
          <Scene
            key={ 'SignIn' }
            component={ SignIn }
            navTransparent={ true }
            renderTitle={ this.renderTitle('Iniciar sesión') }
          />
          <Scene
            key={ 'Register' }
            component={ Register }
            navTransparent={ true }
            renderTitle={ this.renderTitle('Registrarse') }
          />
          <Scene
            key={ 'Menu' }
            component={ Menu }
            navTransparent={ true }
            navBarButtonColor={ '#FE8000' }
            navigationBarStyle={ styles.navBar }
            renderTitle={ this.renderTitle('Menú') }
          />
          <Scene 
            key={ 'ReadCounter' }
            icon={ TabIcon }
            iconName='bicycle'
            colorIcon='#FE8000'
            component={ ReadCounter }
            renderTitle={ this.renderTitle('Leer Contador') }
            navigationBarStyle={ styles.navBar }
            renderLeftButton={ this.renderMenuButton() }
          />
          <Scene 
            key={ 'MyMouvements' }
            icon={ TabIcon }
            iconName='list'
            colorIcon='#FE8000'
            component={ MyMouvements }
            renderTitle={ this.renderTitle('Movimientos') }
            navigationBarStyle={ styles.navBar }
            renderLeftButton={ this.renderMenuButton() }
          />
          <Scene 
            key={ 'Adjust' }
            icon={ TabIcon }
            iconName='wrench'
            colorIcon='#FE8000'
            component={ Adjust }
            renderTitle={ this.renderTitle('Ajustes') }
            navigationBarStyle={ styles.navBar }
            renderLeftButton={ this.renderMenuButton() }
          />
        </Scene>
      </Router> 
    );
  }

  //Access to ReadCounter. There is systemToRead ( != '' )
  renderNavigation2() {
    return (
      <Router> 
        <Scene key='root'>
          <Scene 
            key={ 'ReadCounter' }
            icon={ TabIcon }
            iconName='bicycle'
            colorIcon='#FE8000'
            component={ ReadCounter }
            renderTitle={ this.renderTitle('Leer Contador') }
            navigationBarStyle={ styles.navBar }
            renderLeftButton={ this.renderMenuButton() }
          />
          <Scene 
            key={ 'MyMouvements' }
            icon={ TabIcon }
            iconName='list'
            colorIcon='#FE8000'
            component={ MyMouvements }
            renderTitle={ this.renderTitle('Movimientos') }
            navigationBarStyle={ styles.navBar }
            renderLeftButton={ this.renderMenuButton() }
          />
          <Scene 
            key={ 'Adjust' }
            icon={ TabIcon }
            iconName='wrench'
            colorIcon='#FE8000'
            component={ Adjust }
            renderTitle={ this.renderTitle('Ajustes') }
            navigationBarStyle={ styles.navBar }
            renderLeftButton={ this.renderMenuButton() }
          />
          <Scene
            key={ 'SignIn' }
            component={ SignIn }
            navTransparent={ true }
            renderTitle={ this.renderTitle('Iniciar sesión') }
          />
          <Scene
            key={ 'Register' }
            component={ Register }
            navTransparent={ true }
            renderTitle={ this.renderTitle('Registrarse') }
          />
          <Scene
            key={ 'Menu' }
            component={ Menu }
            navTransparent={ true }
            navBarButtonColor={ '#FE8000' }
            navigationBarStyle={ styles.navBar }
            renderTitle={ this.renderTitle('Menú') }
          />
        </Scene>
      </Router> 
    );
  }

  //Access to Adjust. There isn't systemToRead ( = '' )
  renderNavigation3() {
    return (
      <Router> 
        <Scene key='root'>
        <Scene 
            key={ 'Adjust' }
            icon={ TabIcon }
            iconName='wrench'
            colorIcon='#FE8000'
            component={ Adjust }
            renderTitle={ this.renderTitle('Ajustes') }
            navigationBarStyle={ styles.navBar }
            renderLeftButton={ this.renderMenuButton() }
          />
          <Scene 
            key={ 'MyMouvements' }
            icon={ TabIcon }
            iconName='list'
            colorIcon='#FE8000'
            component={ MyMouvements }
            renderTitle={ this.renderTitle('Movimientos') }
            navigationBarStyle={ styles.navBar }
            renderLeftButton={ this.renderMenuButton() }
          />
          <Scene 
            key={ 'ReadCounter' }
            icon={ TabIcon }
            iconName='bicycle'
            colorIcon='#FE8000'
            component={ ReadCounter }
            renderTitle={ this.renderTitle('Leer Contador') }
            navigationBarStyle={ styles.navBar }
            renderLeftButton={ this.renderMenuButton() }
          />
          <Scene
            key={ 'SignIn' }
            component={ SignIn }
            navTransparent={ true }
            renderTitle={ this.renderTitle('Iniciar sesión') }
          />
          <Scene
            key={ 'Register' }
            component={ Register }
            navTransparent={ true }
            renderTitle={ this.renderTitle('Registrarse') }
          />
          <Scene
            key={ 'Menu' }
            component={ Menu }
            navTransparent={ true }
            navBarButtonColor={ '#FE8000' }
            navigationBarStyle={ styles.navBar }
            renderTitle={ this.renderTitle('Menú') }
          />
        </Scene>
      </Router> 
    );
  }

  render() {
    const { isLogged, loaded } = this.state
    if (!loaded) {
      return (<Preloader />)
    }
    if (isLogged && loaded) {
      console.log('SystemToRead: ', this.state.systemToRead)
      if (this.state.systemToRead !== '') {
        if (this.state.systemToRead === '0') return <Preloader/>
        else return (this.renderNavigation2())
      } else return (this.renderNavigation3())
    } else {
      return (this.renderNavigation1())
    }
  }
}

const styles = StyleSheet.create({
  title: {
    color: '#FE8000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#FE8000',
    fontSize: 15,
  },
  navBar: {
    backgroundColor: 'white',
  },
  cartButton: {
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: 'white',
    height: 70,
  },
});
