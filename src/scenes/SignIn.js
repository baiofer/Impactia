//React imports
import React, { Component } from 'react'
//React Native imports
import { View, Text, KeyboardAvoidingView, StyleSheet, Alert, Dimensions } from 'react-native'
//Components imports
import LogoImage from '../components/LogoImage'
import BackgroundImage from '../components/BackgroundImage'
import AppButton from '../components/AppButton'
import AppInput from '../components/AppInput'
//Validate.js imports
import validator from 'email-validator'
//React Native Router Flux imports
import { Actions } from 'react-native-router-flux'
//Imports from Firebase
//import * as firebase from 'firebase'
import firebase from '@firebase/app'
import '@firebase/auth'
//Utils imports
import * as Utils from '../utils'


export default class SignIn extends Component {

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
            errors.user = 'Introduce un email'
            valid = false
        } else if (!validator.validate(this.state.user)) {
            errors.user = 'Introduce un email válido'
            valid = false
        }
        if (!this.state.password) {
            errors.password = 'Introduce un password'
            valid = false
        } else if (this.state.password.length < 5) {
            errors.password = 'El password debe tener al menos 6 caracteres'
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
                        'User OK',
                        user.user.email)
                    Utils.PersistData.getSystemToRead()
                        .then( (value) => {
                          if (value === '') Actions.Adjust()
                          else return Actions.ReadCounter()
                        })
                })
                .catch( (error) => {
                    if (this._isMounted) {
                        this.setState({
                            loaded: true,
                        })
                    }
                    if (error.code === 'auth/user-not-found') error.message = 'Usuario no registrado'
                    if (error.code === 'auth/user-disabled') error.message = 'Usuario deshabilitado'
                    Alert.alert(
                        'ERROR',
                        error.message)
                })
        }
    } 

    register() {
        Actions.Register()
    }

    render() {
        return(
            <BackgroundImage>
                <KeyboardAvoidingView 
                    style={ styles.container }
                    behavior='padding'
                >
                    <View style={ styles.viewLogo }>
                        <LogoImage />
                    </View>
                    <View style={ styles.viewButton }>
                        <AppInput 
                            placeholder='Usuario'
                            value={ this.state.user }
                            error={ this.state.userError }
                            onChangeText={ (v) => this.setState({ user: v })}
                            keyboardType='email-address'
                        />
                        <AppInput 
                            placeholder= 'Password'
                            value={ this.state.password }
                            error={ this.state.passwordError }
                            onChangeText={ (v) => this.setState({ password: v })}
                            isPassword={ true }
                        />
                        <AppButton
                            bgColor='#FE8000'
                            onPress={ () => this.login() }
                            label='ENTRAR'
                            labelColor='white'
                            iconColor='#FE8000'
                            buttonStyle={ styles.loginButton }
                        />
                    </View>
                    <View style={ styles.viewFooter }>
                        <View style={{ flexDirection: 'row' }}>
                            <Text 
                                style={{ color: '#FE8000' }}
                            >
                                ¿No tienes una cuenta?
                            </Text>
                            <AppButton
                                bgColor='transparent'
                                onPress={ () => this.register() }
                                label='Regístrate'
                                labelColor='#FE8000'
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

