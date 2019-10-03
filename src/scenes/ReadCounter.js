//React imports
import React, { Component } from 'react'
//React Native imports
import { StyleSheet, Text, View, NativeEventEmitter, NativeModules, ListView, ActivityIndicator, Alert } from 'react-native'
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

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => {
    r1 !== r2
}})

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)


export default class ReadCounter extends Component {
    constructor() {
        super()
        this.state = {
            peripherals: new Map(),
            scanning: false,
            connected: false,
            counterIsReaded: false,
            counterReaded: [],
            valueOfCounter: 0,
            userUid: ''
        }
    }

    async componentDidMount() {
        BleManager.start({ showAlert: false })
            .then( () => {
                console.log('Módulo inicilizado')
            })

        this.handleDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral.bind(this))

        this.handleStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan.bind(this))

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
        this.handleDiscover.remove()
        this.handleStop.remove()
        this.handleDisconnect.remove()
        this.handleUpdate.remove()
    }

    handleDiscoverPeripheral(peripheral) {
        var peripherals = this.state.peripherals
        if (!peripherals.has(peripheral.id)) {
            console.log('Got BLE peripheral ', peripheral)
            peripherals.set(peripheral.id, peripheral)
            this.setState({ peripherals })
        }
    }

    handleStopScan() {
        console.log('Scan is stopped')
        this.setState({
            scanning: false,
        })
    }

    handleDisconnectedPeripheral(data) {
        console.log('Data: ', data)
        let peripherals = this.state.peripherals
        let peripheral = peripherals.get(data.peripheral)
        if (peripheral) {
            peripheral.connected = false
            peripherals.set(peripheral.id, peripheral)
            this.setState({ 
                peripherals,
                connected: false,
                counterIsReaded: false,
            })
        }
        console.log('Disconnected from ', data.peripheral)
    }

    startScan() {
        if (!this.state.scanning) {
            this.setState({ periferals: new Map()})
            BleManager.scan([], 3, true)
                .then( (results) => {
                    console.log('Scanning ...')
                    this.setState({
                        scanning: true
                    })
                })
        }
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

    saveCounterReaded(peripheral) {
        value = this.state.valueOfCounter
        valueInHours = this.passCounterToHours(value)
        userUid = this.state.userUid
        const dateNew = Moment()
        const date = dateNew.format('YYYY-MM-DD')
        const hour = dateNew.format('HH:MM:SS')
        firebase.database().ref('Client1/Users/' + userUid + '/lecturas/' + date + '/' + hour).set(value)
        .then( () => {
            Alert.alert(
                'Valor leido del contador',
                valueInHours,
                [{
                    text:'OK',
                    onPress: () => this.test(peripheral),
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

    test(peripheral) {
        console.log('Item to test: ', peripheral.name)
        if (this.state.scanning) return null
        if (peripheral) {
            //If peripheral connected, we disconnect it
            if (peripheral.connected) {
                BleManager.disconnect(peripheral.id)
                console.log('Hay que desconectar el equipo')
            //If terminal not connected, we connect it
            } else {
                BleManager.connect(peripheral.id)
                    .then( () => {
                        console.log('Connected to ', peripheral)
                        let peripherals = this.state.peripherals
                        let p= peripherals.get(peripheral.id)
                        if (p) {
                            p.connected = true
                            peripherals.set(peripheral.id, p)
                            this.setState({ 
                                peripherals,
                                connected: true,
                            })
                        }
                        //Before read and write Bluetooth module, we have to retrieve services
                        BleManager.retrieveServices(peripheral.id)
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
                                        this.saveCounterReaded(peripheral)
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
    }

    //We look for only the client sistem.
    lookForBikeElement(data) {
        if (data === []) return []
        console.log('Lista: ', data)
        let newList = []
        data.forEach( (element) => {
            if (element.advertising.localName === 'BIKE' || element.name === 'Arduino') {
                newList.push(element)
            }
        })
        return newList
    }

    //We render the activity indicator if necesary
    renderActivity(item) {
        if (this.state.scanning || (item.connected && !this.state.counterIsReaded)) {
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

    //We render the system to read
    renderItem(item) {
        console.log('Item a conectar: ', item)
        const color = item.connected ? 'green' : '#FE8000'
        return(
            <View>
                <AppButton
                    bgColor={ color }
                    onPress={ () => this.test(item)}
                    label='Leer Contador'
                    labelColor='white'
                    iconColor='white'
                />
                { this.renderActivity(item) }
            </View>
            
        )
    }

    renderListView(dataSource) {
        if (!this.state.scanning) {
            <ListView 
                enableEmptySections={ true }
                dataSource={ dataSource }
                renderRow={ (item) => this.renderItem(item) }
            />
        }
    }

    render() {
        const list = Array.from(this.state.peripherals.values())
        //Look for element to connect
        const newList = this.lookForBikeElement(list)
        const dataSource = ds.cloneWithRows(newList)
        console.log('Array: ', list)
        console.log('NewList: ', newList)
        const value = this.state.counterReaded
        console.log('Value: ', value)

        return(
            <View style={ styles.container }>
                <LogoImage />
                <AppButton
                    bgColor='#FE8000'
                    onPress={ () => this.startScan()}
                    label='Buscar y enlazar equipo'
                    labelColor='white'
                    iconColor='white'
                />
                <ListView 
                    enableEmptySections={ true }
                    dataSource={ dataSource }
                    renderRow={ (item) => this.renderItem(item) }
                />
                { /*this.renderCounter(this.state.valueOfCounter)*/ }   
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