//React imports
import React, { Component } from 'react'
//React Native imports
import { StyleSheet, View, NativeEventEmitter, NativeModules, ActivityIndicator, Alert } from 'react-native'
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

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)



export default class ReadCounter extends Component {
    constructor() {
        super()
        this.state = {
            scanning: false,
            connected: false,
            counterIsReaded: false,
            counterReaded: [],
            valueOfCounter: 0,
            userUid: '',
            systemToRead: '9E39793E-EEDE-49FC-2166-68C760954602'
        }
    }

    async componentDidMount() {
        BleManager.start({ showAlert: false })
            .then( () => {
                console.log('Módulo inicilizado')
            })
        this.handleDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral.bind(this))
        //Para coger el userUid, lo hago desde firebase o lo puedo hacer desde AsyncStorage cuando lo implemente
        await firebase.auth().onAuthStateChanged( (user) => {
            if (user !== null) {
              this.setState({
                userUid: user.uid,
              })
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
        //Return only an array with digits valids
        return result
    }

    //saveCounterReaded(peripheral) {
    saveCounterReaded() {
        value = this.state.valueOfCounter
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
        if (this.state.scanning) return null
        //If peripheral connected, we disconnect it
        if (this.state.connected) {
            BleManager.disconnect(this.state.systemToRead)
            console.log('Hay que desconectar el equipo')
        //If terminal not connected, we connect it
        } else {
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

    render() {
        const color = this.state.connected ? 'green' : '#FE8000'
        return(
            <View style={ styles.container }>
                <LogoImage />
                <AppButton
                    bgColor={ color }
                    onPress={ () => this.test()}
                    label='Leer Contador'
                    labelColor='white'
                    iconColor='white'
                />
                { this.renderActivity() }
            </View>
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
})