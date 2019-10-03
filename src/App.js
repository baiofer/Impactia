//React imports
import React, {Component} from 'react';
//React Native imports
import { StyleSheet, View, Text, Alert, YellowBox, TouchableOpacity } from 'react-native';
//Components imports
import SignIn from './scenes/SignIn';
import Register from './scenes/Register'
import ReadCounter from './scenes/ReadCounter'
import TabIcon from './components/TabIcon'
import Preloader from './components/Preloader'
import MyMouvements from './scenes/MyMouvements'
import Adjust from './scenes/Adjust'
import Menu from './scenes/Menu'
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

  constructor() {
    super()
    this.state = {
      isLogged: false,
      loaded: false,
      userLogged: '',
    }
  }

  //LIVE CYCLE
  componentWillMount() {
    console.ignoredYellowBox = ['Remote debugger']
    YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated'])
    //const userLogged = Utils.PersistData.getUserLogged()    
    //this.setState({
      //userLogged: userLogged,
    //})
  }

  async componentDidMount() {
    await firebase.auth().onAuthStateChanged( (user) => {
      if (user !== null) {
        this.setState({
          isLogged: true,
          loaded: true,
          userLogged: user.email,
        })
        Alert.alert(
          'User OK',
          user.email)
        //Save userLogged & userUid
        //Utils.PersistData.setUserLogged(user.email)
        //Utils.PersistData.setUserUid(user.uid)
      } else {
        this.setState({
          isLogged: false,
          loaded: true,
        })
      }
    })
  }

  renderTitle(title) {
    return(
      <View style={ styles.titleNav }>
        <Text style={ styles.title }>{ title }</Text>
        <Text style={ styles.subtitle }>{ this.state.userLogged }</Text>
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

  renderNavigation1() {
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
            key={ 'Menu' }
            component={ Menu }
            navTransparent={ true }
            navBarButtonColor={ '#FE8000' }
            navigationBarStyle={ styles.navBar }
            renderTitle={ this.renderTitle('Menú') }
          />
          <Scene
            key={ 'TabBar' }
            tabs={ true }
            hideNavBar={ false }
            tabBarStyle={ styles.tabBar }
            navTransparent={ true }
            navigationBarStyle={ styles.navBar }
            default={ 'ReadCounter' }
            activeTintColor='grey'
            inactiveTintColor='#fff'
            renderLeftButton={ this.renderMenuButton() }
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

  renderNavigation2() {
    return (
      <Router> 
        <Scene key='root'>
          <Scene
            key={ 'TabBar' }
            tabs={ true }
            hideNavBar={ false }
            tabBarStyle={ styles.tabBar }
            navTransparent={ true }
            navigationBarStyle={ styles.navBar }
            default={ 'ReadCounter' }
            activeTintColor='grey'
            inactiveTintColor='#fff'
            renderLeftButton={ this.renderMenuButton() }
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
    if (isLogged) {
      return (this.renderNavigation2())
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
    backgroundColor: '#FE8000',
  },
  cartButton: {
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: '#FE8000',
  },
});
