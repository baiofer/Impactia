/*
PANTALLA DE REGISTRO

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
    Constants

Entradas:
    Ninguna
Salidas:
    userLogged (Email del usuario logeado). Guardado enAsyncStorage
    userUid (Uid de firebase del usuario logueado). Guardado en AsyncStorage

Modificaciones
    Ninguna
*/

//React imports
import React, { Component } from 'react'
//React Native imports
import { StyleSheet, View, Text, Alert, KeyboardAvoidingView, Dimensions } from 'react-native'
//Components imports
import BackgroundImage from '../../components/BackgroundImage'
import AppButton from '../../components/AppButton'
import AppInput from '../../components/AppInput'
import LogoImage from '../../components/LogoImage'
//Imports from Firebase
import firebase from '@firebase/app'
import '@firebase/auth'
//React Native Router Flux imports
import { Actions } from 'react-native-router-flux'
//Validate.js imports
import validator from 'email-validator'
//Utils imports
import * as Utils from '../../utils'



export default class Register extends Component {

    language = Utils.Spanish
    _isMounted = false

    constructor(props) {
        super(props)
        this.state = {
            user: '',
            userError: '',
            password: '',
            passwordError: '',
            repeatPassword: '',
            repeatPasswordError: '',
        }
    }

    //Life cycle
    componentDidMount() {
        this._isMounted = true
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

    //Register user in Firebase Auth
    postFirebasePerson() {
        const { user, password } = this.state
            //Register in FIREBASE
            this.setState({
                loaded: false,
            })
            firebase.auth().createUserWithEmailAndPassword(user, password)
                .then( (userReg) => {
                    //Save userLogged & userUid
                    Utils.PersistData.setUserLogged(userReg.user.email)
                    Utils.PersistData.setUserUid(userReg.user.uid)
                    //User registered OK. 
                    Alert.alert(
                        this.language.userCreated, 
                        userReg.user.email,)
                })
                .catch( (error) => {
                    if (this._isMounted) {
                        this.setState({
                            loaded: true,
                        })
                    }
                    //If user is already in use, simply go to login in SignIn
                    if (error.message === 'The email address is already in use by another account.') {
                        Alert.alert(
                            this.language.userAlreadyInUse, 
                            error.message,)
                        this.login()
                    } else {
                        Alert.alert(
                            this.language.userNotCreated, 
                            error.message,)
                    }
                })
    }

    //Functions
    validateForm() {
        let valid = true
        let errors = {}
        //Validation of user (email)
        if (!this.state.user) {
            errors.user = this.language.putEmail
            valid = false
        } else if (!validator.validate(this.state.user)) {
            errors.user = Utils.Spanish.putValidEmail
            valid = false
        }
        //Validation of password
        if (!this.state.password) {
            errors.password = this.language.putPassword
            valid = false
        } else if (this.state.password.length < 5) {
            errors.password = this.language.putValidPassword
            valid = false
        }
        //Confirmation of password
        if (this.state.password !== this.state.repeatPassword) {
            errors.repeatPassword = this.language.equalsPasswords
            valid = false
        }
        //Update errors for render
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
        if (errors.repeatPassword) {
            this.setState({
                repeatPasswordError: errors.repeatPassword ? errors.repeatPassword : '',
            })
            valid = false
        } else {
            this.setState({
                repeatPasswordError: '',
            })
        }
        //Return validation
        return valid
    }

    //Register User
    register() {
        if (this.validateForm()) {
            this.postFirebasePerson()
        }
    }

    //Return to SignIn
    login() {
        Actions.pop()
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
                            placeholder= { this.language.email }
                            value={ this.state.user }
                            error={ this.state.userError }
                            onChangeText={ (v) => this.setState({ user: v })}
                            keyboardType='email-address'
                        />
                        <AppInput 
                            placeholder= { this.language.password}
                            value={ this.state.password }
                            error={ this.state.passwordError }
                            onChangeText={ (v) => this.setState({ password: v })}
                        />
                        <AppInput 
                            placeholder= { this.language.confirmPassword }
                            value={ this.state.repeatPassword }
                            error={ this.state.repeatPasswordError }
                            onChangeText={ (v) => this.setState({ repeatPassword: v })}
                        />
                        <AppButton
                            bgColor={ buttonBackgroundColor }
                            onPress={ () => this.register()}
                            label={ this.language.registerButton }
                            labelColor={ buttonLabelColor }
                            iconColor={ buttonBackgroundColor }
                            buttonStyle={ styles.loginButton }
                        />
                    </View>
                    <View style={ styles.Footer }>
                        <View style={{ flexDirection: 'row' }}>
                            <Text 
                                style={{ color: titleNavColor }}
                            >
                                { this.language.alreadyHaveACount}
                            </Text>
                            <AppButton
                                bgColor='transparent'
                                onPress={ () => this.login() }
                                label={ this.language.beginSession }
                                labelColor={ buttonBackgroundColor }
                                setWidth={ 100 }
                                buttonStyle={ styles.loginStyle}
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
      marginTop: 20,
      marginBottom: 30
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
        marginBottom: 30    ,
    },
    loginStyle: {
        backgroundColor: 'transparent',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 0,
        height: 20  ,
        borderColor: "transparent",
        borderWidth: 0,
    }
  });
