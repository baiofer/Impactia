//React imports
import React, { Component } from 'react'
//React Native imports
import { StyleSheet, View } from 'react-native'
//Components imports
import BackgroundImage from '../components/BackgroundImage'
import LogoImage from '../components/LogoImage'
import AppButton from '../components/AppButton'
//React Native Router Flux imports
import { Actions } from 'react-native-router-flux'
//Imports from Firebase
import * as firebase from 'firebase'



export default class Menu extends Component {

    constructor(props) {
        super(props)
        this.state = {
            userLogged: '',
        }
    }
    //Life cycle
    async componentDidMount() {
        //Get userLogged from AsyncStorage
        //const userLogged = await Utils.PersistData.getUserLogged()
            //this.setState({
                //userLogged: userLogged,
            //})
    }

    //Functions
    logOut() {
        //Delete userLogged in AsyncStorage
        //Utils.PersistData.setUserLogged('')
        //Utils.PersistData.setUserUid('')
        //Logout firebase
        firebase.auth().signOut()
        Actions.SignIn()
    }

    //Renders
    render() {
        return(
            <BackgroundImage>
                <View style={ styles.container }>
                    <LogoImage />
                    <AppButton
                        bgColor='#FE8000'
                        onPress={ () => this.logOut()}
                        label='LOGOUT'
                        labelColor='white'
                        iconColor='white'
                        //buttonStyle={ styles.loginButton }
                    />
                </View>
            </BackgroundImage>
        )
    }
}

//Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
});