//React imports
import React, { Component } from 'react'
//React Native imports
import { StyleSheet, View, NativeEventEmitter, NativeModules, ActivityIndicator, Alert, Text, Platform, PermissionsAndroid } from 'react-native'
//Native base imports
import { Container, Footer, FooterTab, Button } from 'native-base'
//Bluetooth imports
import BleManager from 'react-native-ble-manager'
import { stringToBytes, bytesToString } from 'convert-string'
//Imports from Firebase
import firebase from '@firebase/app'
import '@firebase/auth'
import '@firebase/database'
//Moment imports (Date)
import Moment from 'moment'
//Components imports
import LogoImage from '../components/LogoImage'
import AppButton from '../components/AppButton'
//Utils imports
import * as Utils from '../utils'
import { Actions } from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/FontAwesome'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)



export default class ReadCounter extends Component {

    constructor(props) {
        super(props)
        this.state = {
            scanning: false,
            connected: false,
            counterIsReaded: false,
            counterReaded: [],
            valueOfCounter: 0,
            userUid: '',
            systemToRead: '',
            date: '',
            dateError: 'Error',
        }
    }

    async componentDidMount() {
        await Utils.PersistData.getBLEIsConnect()
            .then( (bleIsConnect) => {
                if (bleIsConnect === '0') {
                    BleManager.start({ showAlert: false })
                        .then( () => {
                            console.log('Módulo ReadCounter inicilizado')
                            Utils.PersistData.setBLEIsConnect('1')
                    })
                }  
            })
        this.handleDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral.bind(this))
        //For Android only
        if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                if (result) {
                  console.log("Permission is OK");
                } else {
                  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                    if (result) {
                      console.log("User accept");
                    } else {
                      console.log("User refuse");
                    }
                  });
                }
          });
        }
        //Cojemos el sistema a leer y el userUid desde AsyncStorage
        Utils.PersistData.getSystemToRead()
            .then( (value) => {
                if (value !== 'none' || value !== '') {
                    this.setState({
                        systemToRead: value,
                    })
                    console.log('SystemToReadInReadCounter: ', this.state.systemToRead)
                }
            })
        Utils.PersistData.getUserUid()
            .then( (value) => {
                if (value !== 'none' || value !== '') {
                    this.setState({
                        userUid: value,
                    })
                    console.log('UserUidInReadCounter: ', this.state.userUid)
                }
            })    
    }

    componentWillUnmount() {
        this.handleDisconnect.remove()
    }
    
    handleDisconnectedPeripheral(data) {
        console.log('Data: ', data)
        this.setState({ 
            connected: false,
            counterIsReaded: false,
        })
        console.log('Disconnected from ', data.peripheral)
    }
    
    valueOfCounter(counterReaded) {
        //Count of digits valids in array (from [0] to "")
        var i = 0
        while((counterReaded[i] === '0' || counterReaded[i] === '1' ||
              counterReaded[i] === '2' || counterReaded[i] === '3' ||
              counterReaded[i] === '4' || counterReaded[i] === '5' ||
              counterReaded[i] === '6' || counterReaded[i] === '7' ||
              counterReaded[i] === '8' || counterReaded[i] === '9') && i<8) {
            i++
        }
        //Pass the array of char to an array of integers
        const value = counterReaded.slice(0, i)
        const newValue = value.map( function (x)  {
            return parseInt(x, 10)
        })
        var result = 0
        //Pass the array of integers to an integer
        for (var z=0; z<newValue.length; z++) {
            result *= 10
            result += newValue[z]
        }
        console.log('ValueOfCounter: ', result)
        //Return only an array with digits valids
        return result
    }

    //saveCounterReaded(peripheral) {
    saveCounterReaded() {
        value = this.state.valueOfCounter
        if (value === 0) {
            Alert.alert(
                'El contador está a 0',
                '',
                [{
                    text:'OK',
                    onPress: () => this.test(),
                }],
            )
            return
        }
        valueInHours = this.passCounterToHours(value)
        userUid = this.state.userUid
        const dateNew = Moment()
        const date = dateNew.format('YYYY-MM-DD')
        const hour = dateNew.format('hh:mm:ss')
        const reading = {
            fecha: date,
            hora: hour,
            contador: value
        }
        console.log('CounterToFirebase: ', reading)
        firebase.database().ref('Client1/Users/' + userUid + '/lecturas/' + date + '_' + hour).set(reading)
        .then( () => {
            Alert.alert(
                'Valor leido del contador',
                valueInHours,
                [{
                    text:'OK',
                    onPress: () => this.test(),
                }],
            )
        })
        .catch( (error) => {
            Alert.alert(
                'Error saving counter',
                error)
        })
    }

    passCounterToHours(value) {
        //We pass the counter to time (days, hours, minutes and seconds)
        console.log('RenderCounterValue: ', value)
        const seconds = value % 60
        const minutesLeft = Math.trunc(value / 60)
        const minutes = minutesLeft % 60
        const hours = Math.trunc(minutesLeft / 60)
        return `${ hours } horas, ${ minutes } minutos, ${ seconds } segundos`
    }

    test() {
        if (this.state.scanning || (this.state.connected && !this.state.counterIsReaded)) return null
        //If peripheral connected, we disconnect it
        if (this.state.connected) {
            BleManager.disconnect(this.state.systemToRead)
            console.log('Hay que desconectar el equipo')
        //If terminal not connected, we connect it
        } else {
            console.log('Voy a conectar ', this.state.systemToRead)
            BleManager.connect(this.state.systemToRead)
                .then( () => {
                    console.log('Connected to ', this.state.systemToRead)
                    this.setState({ 
                        connected: true,
                    })
                    //Before read and write Bluetooth module, we have to retrieve services
                    BleManager.retrieveServices(this.state.systemToRead)
                        .then( (peripheralInfo) => {
                            //When services are retrieved, we read the counter
                            console.log('Retrieved from ', peripheralInfo)
                            //PeripheralId
                            const per = peripheralInfo.id
                            //serviceUUID
                            const ser = peripheralInfo.characteristics[0].service
                            //characteristicUUID
                            const cha1 = peripheralInfo.characteristics[0].characteristic
                            const cha2 = peripheralInfo.characteristics[1].characteristic
                            const cha3 = peripheralInfo.characteristics[2].characteristic
                            const cha4 = peripheralInfo.characteristics[3].characteristic
                            const cha5 = peripheralInfo.characteristics[4].characteristic
                            const cha6 = peripheralInfo.characteristics[5].characteristic
                            const cha7 = peripheralInfo.characteristics[6].characteristic
                            const cha8 = peripheralInfo.characteristics[7].characteristic
                            //data
                            const data = stringToBytes('0')
                            //Read Counter
                            console.log('Aqui leo de BIKE el Contador')
                            var counterReaded = []
                            BleManager.read(per, ser, cha1)
                                .then( (readData) => {
                                    counterReaded[7] = bytesToString(readData)
                                })
                                .catch( (error) => {
                                    console.log('ErrorReading: ', error)
                                })
                            BleManager.read(per, ser, cha2)
                                .then( (readData) => {
                                    counterReaded[6] = bytesToString(readData)
                                })
                                .catch( (error) => {
                                    console.log('ErrorReading: ', error)
                                })
                            BleManager.read(per, ser, cha3)
                                .then( (readData) => {
                                    counterReaded[5] = bytesToString(readData)
                                })
                                .catch( (error) => {
                                    console.log('ErrorReading: ', error)
                                })
                            BleManager.read(per, ser, cha4)
                                .then( (readData) => {
                                    counterReaded[4] = bytesToString(readData)
                                })
                                .catch( (error) => {
                                    console.log('ErrorReading: ', error)
                                })
                            BleManager.read(per, ser, cha5)
                                .then( (readData) => {
                                    counterReaded[3] = bytesToString(readData)
                                })
                                .catch( (error) => {
                                    console.log('ErrorReading: ', error)
                                })
                            BleManager.read(per, ser, cha6)
                                .then( (readData) => {
                                    counterReaded[2] = bytesToString(readData)
                                })
                                .catch( (error) => {
                                    console.log('ErrorReading: ', error)
                                })
                            BleManager.read(per, ser, cha7)
                                .then( (readData) => {
                                    counterReaded[1] = bytesToString(readData)
                                })
                                .catch( (error) => {
                                    console.log('ErrorReading: ', error)
                                })
                            BleManager.read(per, ser, cha8)
                                .then( (readData) => {
                                    counterReaded[0] = bytesToString(readData)
                                })
                                .catch( (error) => {
                                    console.log('ErrorReading: ', error)
                                })
                                setTimeout( () => {
                                    const counterValue = this.valueOfCounter(counterReaded)
                                    this.setState({
                                        counterIsReaded: true,
                                        valueOfCounter: counterValue,
                                    })
                                    //When counter is readed, I send to firebase his value and  we put counter to 0
                                    this.saveCounterReaded()
                                    //Write characteristics
                                    BleManager.write(per, ser, cha1, data)
                                    .catch( (error) => {
                                        console.log('ErrorWritting: ', error)
                                    })
                                    BleManager.write(per, ser, cha2, data)
                                    .catch( (error) => {
                                        console.log('ErrorWritting: ', error)
                                    })
                                    BleManager.write(per, ser, cha3, data)
                                    .catch( (error) => {
                                        console.log('ErrorWritting: ', error)
                                    })
                                    BleManager.write(per, ser, cha4, data)
                                    .catch( (error) => {
                                        console.log('ErrorWritting: ', error)
                                    })
                                    BleManager.write(per, ser, cha5, data)
                                    .catch( (error) => {
                                        console.log('ErrorWritting: ', error)
                                    })
                                    BleManager.write(per, ser, cha6, data)
                                    .catch( (error) => {
                                        console.log('ErrorWritting: ', error)
                                    })
                                    BleManager.write(per, ser, cha7, data)
                                    .catch( (error) => {
                                        console.log('ErrorWritting: ', error)
                                    })
                                    BleManager.write(per, ser, cha8, data)
                                    .catch( (error) => {
                                        console.log('ErrorWritting: ', error)
                                    }) 
                                }, 3000)
                            })
                            .catch( (error) => {
                                console.log('ErrorRetrieve: ', error)
                            })
                    })
                .catch( (error) => {
                    Alert.alert(
                        'El equipo a leer no está en el alcance',
                        '',
                    )
                    console.log('ErrorConnect: ', error)
                })
        }
    }

    //We render the activity indicator if necesary
    renderActivity() {
        if (this.state.scanning || (this.state.connected && !this.state.counterIsReaded)) {
            return(
                <ActivityIndicator 
                    size="large" 
                    color="#FE8000"
                    style={ {marginTop: 20 } } 
                />
            )
        }
        return null
    }

    //If not exits system to read, we put a message
    renderReadButton() {
        const color = this.state.connected ? 'green' : '#FE8000'
        if (this.state.systemToRead === '') {
            return(
                <View style={ styles.texts }>
                    <Text style={ styles.text1 }>NO HAY SISTEMA ENLAZADO</Text>
                    <Text style={ styles.text2 }>Vaya a configuración y enlace un sistema</Text>
                </View>
            )
        } else {
            return(
                <AppButton
                    bgColor={ color }
                    onPress={ () => this.test()}
                    label='Leer Contador'
                    labelColor='white'
                    iconColor='white'
                />
            )
        }
    }

    renderTabBar() {
        return(
            <Footer>
                <FooterTab>
                    <Button 
                        vertical
                        //onPress={ () => Actions.replace('ReadCounter') }
                    >
                        <Icon 
                            name='bicycle' 
                            style={{ color: 'grey' }}
                            size={ 30 }
                        />
                        <Text style={{ color: 'grey', fontSize: 12 }}>Contador</Text>
                    </Button>
                    <Button 
                        vertical
                        onPress={ () => Actions.MyMouvements() }
                    >
                        <Icon 
                            name='list' 
                            style={{ color: '#FE8000' }}
                            size={ 30 }
                        />
                        <Text style={{ color: '#FE8000', fontSize: 12 }}>Movimientos</Text>
                    </Button>
                    <Button 
                        vertical
                        onPress={ () => Actions.Adjust() }
                    >
                        <Icon 
                            name='wrench' 
                            style={{ color: '#FE8000' }}
                            size={ 30 }
                        />
                        <Text style={{ color: '#FE8000', fontSize: 12 }}>Ajustes</Text>
                    </Button>
                </FooterTab>
            </Footer>
        )
    }

    render() { 
        return(
            <Container style={ styles.container }>
                <View style={ styles.container }>
                    <LogoImage />
                    { this.renderReadButton() }
                    { this.renderActivity() }
                </View>
                { this.renderTabBar() }
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        height: 30,
    },
    texts: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text1: {
        color: '#FE8000',
        fontSize: 20,
        fontWeight: 'bold',
      },
      text2: {
        color: '#FE8000',
        fontSize: 15,
      },
})