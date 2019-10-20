//React imports
import React, { Component } from 'react'
//React Native imports
import { Linking, StyleSheet, View, Text, Alert, KeyboardAvoidingView, Dimensions } from 'react-native'
//Components imports
import BackgroundImage from '../components/BackgroundImage'
import AppButton from '../components/AppButton'
import AppInput from '../components/AppInput'
import LogoImage from '../components/LogoImage'
//Imports from Firebase
//import * as firebase from 'firebase'
import firebase from '@firebase/app'
import '@firebase/auth'
//React Native Router Flux imports
import { Actions } from 'react-native-router-flux'
//Validate.js imports
import validator from 'email-validator'



export default class Register extends Component {

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
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    //Webservice functions FIREBASE
    //POST user
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
                    Alert.alert(
                        'Usuario creado', 
                        userReg.user.email,)
                })
                .catch( (error) => {
                    if (this._isMounted) {
                        this.setState({
                            loaded: true,
                        })
                    }
                    if (error.message === 'The email address is already in use by another account.') {
                        Alert.alert(
                            'Usuario ya creado en Firebase', 
                            error.message,)
                        this.login()
                    } else {
                        Alert.alert(
                            'Error. Usuario no creado en Firebase', 
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
            errors.user = 'Introduce un email'
            valid = false
        } else if (!validator.validate(this.state.user)) {
            errors.user = 'Introduce un email válido'
            valid = false
        }
        //Validation of password
        if (!this.state.password) {
            errors.password = 'Introduce un password'
            valid = false
        } else if (this.state.password.length < 5) {
            errors.password = 'El password debe tener al menos 6 caracteres'
            valid = false
        }
        //Confirmation of password
        if (this.state.password !== this.state.repeatPassword) {
            errors.repeatPassword = 'Los passwords deben ser iguales'
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

    register() {
        if (this.validateForm()) {
            this.postFirebasePerson()
        }
    }

    login() {
        Actions.pop()
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
                    <View style={ styles.viewButtons }>
                        <AppInput 
                            placeholder= 'Email'
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
                        />
                        <AppInput 
                            placeholder= 'Confirma el Password'
                            value={ this.state.repeatPassword }
                            error={ this.state.repeatPasswordError }
                            onChangeText={ (v) => this.setState({ repeatPassword: v })}
                        />
                        <AppButton
                            bgColor='#FE8000'
                            onPress={ () => this.register()}
                            label='REGISTRO'
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
                                Ya tienes una cuenta?
                            </Text>
                            <AppButton
                                bgColor='transparent'
                                onPress={ () => this.login() }
                                label='Iniciar Sesión'
                                labelColor='#FE8000'
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