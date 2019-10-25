/*
PANTALLA DE LOGIN

Dependencias:
    email-validator
    react-native-router-flux
    firebase
Componentes:
    LogoImage
    BackgroundImage
    AppButton
    AppInput
Utilidades:
    PersistData

Entradas:
    Ninguna
Salidas:
    userLogged (Email del usuario logeado). Guardado enAsyncStorage
    userUid (Uid de firebase del usuario logueado). Guardado en AsyncStorage

Modificaciones
    Cambiar función login, para saltar al sitio deseado una vez realizado un login correcto
*/

//React imports
import React, { Component } from 'react'
//React Native imports
import { View, Text, KeyboardAvoidingView, StyleSheet, Alert, Dimensions } from 'react-native'
//Components imports
import LogoImage from '../../components/LogoImage'
import BackgroundImage from '../../components/BackgroundImage'
import AppButton from '../../components/AppButton'
import AppInput from '../../components/AppInput'
//Validate.js imports
import validator from 'email-validator'
//React Native Router Flux imports
import { Actions } from 'react-native-router-flux'
//Imports from Firebase
import firebase from '@firebase/app'
import '@firebase/auth'
//Utils imports
import * as Utils from '../../utils'



export default class SignIn extends Component {

    language = Utils.Spanish
    _isMounted = false

    constructor(props) {
        super(props)
        this.state = {
            user: '',
            userError: '',
            password: '',
            passwordError: '',
            loaded: true,
        }
    }

    //Life cycle
    componentDidMount() {
        this._isMounted = true
        console.disableYellowBox = true
        Utils.PersistData.getLanguage()
            .then( (value) => {
                if (value === 'English') {
                    this.language = value
                }
            })
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    //Functions
    testEmail(email) {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        return reg.test(email) === 0
    }

    validateForm() {
        let valid = true
        let errors = {}
        if (!this.state.user) {
            errors.user = this.language.putEmail
            valid = false
        } else if (!validator.validate(this.state.user)) {
            errors.user = this.language.putValidEmail
            valid = false
        }
        if (!this.state.password) {
            errors.password = this.language.putPassword
            valid = false
        } else if (this.state.password.length < 5) {
            errors.password = this.language.putValidPassword
            valid = false
        }
        if (errors.user) {
            this.setState({
                userError: errors.user ? errors.user : '',
            })
            valid = false
        } else {
            this.setState({
                userError: '',
            })
        }
        if (errors.password) {
            this.setState({
                passwordError: errors.password ? errors.password : '',
            })
            valid = false
        } else {
            this.setState({
                passwordError: '',
            })
        }
        return valid
    }

    login() {
        //Vadidation against FIREBASE
        if (this.validateForm()) {
            const username = this.state.user
            const password = this.state.password
            this.setState({
                loaded: false,
            })
            firebase.auth().signInWithEmailAndPassword(username, password)
                .then( (user) => {
                    if (this._isMounted) {
                        this.setState({
                            loaded: true,
                        })
                    }
                    //Save userLogged & userUid
                    Utils.PersistData.setUserLogged(user.user.email)
                    Utils.PersistData.setUserUid(user.user.uid)
                    Alert.alert(
                        this.language.userOk,
                        user.user.email)
                    //LOGIN OK. Decide where to go
                    Actions.Menu()
                })
                .catch( (error) => {
                    if (this._isMounted) {
                        this.setState({
                            loaded: true,
                        })
                    }
                    console.log('error.code: ', error.code)
                    if (error.code === 'auth/user-not-found') error.message = this.language.userNotOk
                    if (error.code === 'auth/user-disabled') error.message = this.language.userDeleted
                    if (error.code === 'auth/wrong-password') error.message = this.language.wrongPassword
                    Alert.alert(
                        this.language.error,
                        error.message)
                })
        }
    } 

    register() {
        Actions.Register()
    }

    recoverPass() {
        const username = this.state.user
        firebase.auth().sendPasswordResetEmail(username)
                .then( (user) => {
                    if (this._isMounted) {
                        this.setState({
                            loaded: true,
                        })
                    }
                    Alert.alert(
                        this.language.emailSended,
                        username)
                })
                .catch( (error) => {
                    if (this._isMounted) {
                        this.setState({
                            loaded: true,
                        })
                    }
                    console.log('error.code: ', error.code)
                    if (error.code === 'auth/user-not-found') error.message = this.language.userNotOk
                    if (error.code === 'auth/user-disabled') error.message = this.language.userDeleted
                    if (error.code === 'auth/wrong-password') error.message = this.language.wrongPassword
                    if (error.code === 'auth/invalid-email') error.message = this.language.invalidEmail
                    Alert.alert(
                        this.language.error,
                        error.message)
                })
    }

    render() {
        const buttonBackgroundColor = Utils.Constants.buttonBackgroundColor
        const buttonLabelColor = Utils.Constants.buttonLabelColor
        const backgroundColor = Utils.Constants.backgroundcolor
        const titleNavColor = Utils.Constants.titleNavColor
        return(
            <BackgroundImage backgroundColor={ backgroundColor }>
                <KeyboardAvoidingView 
                    style={ styles.container }
                    behavior='padding'
                >
                    <View style={ styles.viewLogo }>
                        <LogoImage />
                    </View>
                    <View style={ styles.viewButtons }>
                        <AppInput 
                            placeholder={ this.language.user }
                            value={ this.state.user }
                            error={ this.state.userError }
                            onChangeText={ (v) => this.setState({ user: v })}
                            keyboardType='email-address'
                        />
                        <AppInput 
                            placeholder= { this.language.password }
                            value={ this.state.password }
                            error={ this.state.passwordError }
                            onChangeText={ (v) => this.setState({ password: v })}
                            isPassword={ true }
                        />
                        <AppButton
                            bgColor={ buttonBackgroundColor }
                            onPress={ () => this.login() }
                            label={ this.language.enter }
                            labelColor={ buttonLabelColor }
                            iconColor={ buttonBackgroundColor }
                            buttonStyle={ styles.loginButton }
                        />
                    </View>
                    <View style={ styles.viewFooter }>
                        <View style={{ flexDirection: 'row' }}>
                            <Text 
                                style={{ color:  titleNavColor }}
                            >
                                { this.language.dontHaveACount }
                            </Text>
                            <AppButton
                                bgColor='transparent'
                                onPress={ () => this.register() }
                                label={ this.language.register}
                                labelColor={ buttonBackgroundColor }
                                setWidth={ 100 }
                                buttonStyle={ styles.registerStyle}
                            />
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text 
                                style={{ color:  titleNavColor }}
                            >
                                { this.language.passwordForgotten }
                            </Text>
                            <AppButton
                                bgColor='transparent'
                                onPress={ () => this.recoverPass() }
                                label={ this.language.recoverPass}
                                labelColor={ buttonBackgroundColor }
                                setWidth={ 100 }
                                buttonStyle={ styles.registerStyle}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
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
        marginTop: 30,
    },
    viewLogo: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60, 
        height: (Dimensions.get('window').height / 3) - 80,
    },
    viewButtons: {
        justifyContent: 'center',
        alignItems: 'center',
        height: Dimensions.get('window').height / 2,
    },
    viewFooter: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
    },
    loginButton: {
        marginBottom: 20,
    },
    registerStyle: {
        backgroundColor: 'transparent',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 0,
        height: 25,
        borderColor: "transparent",
        borderWidth: 0,
    }
  });
