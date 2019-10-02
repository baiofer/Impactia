import React, { Component } from 'react'
import { StyleSheet, Text, View, TouchableHighlight, NativeEventEmitter, NativeModules, ListView, ActivityIndicator } from 'react-native'
import BleManager from 'react-native-ble-manager'
import { stringToBytes, bytesToString } from 'convert-string'

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
            valueOfCounter: 0
        }
    }

    componentDidMount() {
        BleManager.start({ showAlert: false })
            .then( () => {
                console.log('Módulo inicilizado')
            })

        this.handleDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral.bind(this))

        this.handleStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan.bind(this))

        this.handleDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral.bind(this))
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

    test(peripheral) {
        console.log('Item to test: ', peripheral.name)
        while (this.state.scanning) {}
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
                                    //When counter is readed, we put counter to 0
                                    setTimeout( () => {
                                        const counterValue = this.valueOfCounter(counterReaded)
                                        this.setState({
                                            counterIsReaded: true,
                                            valueOfCounter: counterValue,
                                        })
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
        if (item.connected && !this.state.counterIsReaded) {
            return(
                <ActivityIndicator size="large" color="#0000ff" />
            )
        }
        return null
    }

    //We render the system to read
    renderItem(item) {
        console.log('Item a conectar: ', item)
        const color = item.connected ? 'green' : '#ccc'
        return(
            <View>
                <TouchableHighlight
                style={ styles.button1 }
                onPress={ () => this.test(item) }
                >
                    <View
                        style={ [styles.row, { backgroundColor: color }]}
                    >
                        <Text style={ styles.item1 }>Enlazado equipo { item.id } </Text>
                        <Text style={ styles.item1 }>Leer CONTADOR</Text>
                    </View> 
                </TouchableHighlight>
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

    renderCounter(value) {
        //We pass the counter to time (days, hours, minutes and seconds)
        console.log('RenderCounterValue: ', value)
        const seconds = value % 60
        console.log('Seconds: ', seconds)
        const minutes = (seconds * 60) % 60
        console.log('Minutes: ', minutes)
        const hours = (minutes * 60) % 60
        console.log('Hours: ', hours)
        const days = (hours * 60) / 24
        console.log('Days: ', days)
        return (
            <Text>COUNTER VALUE: { value }</Text>
        )
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
                <TouchableHighlight
                    style={ styles.button }
                    onPress={ () => this.startScan()}
                >
                    <Text>Buscar y enlazar equipo</Text>
                </TouchableHighlight>
                <ListView 
                    enableEmptySections={ true }
                    dataSource={ dataSource }
                    renderRow={ (item) => this.renderItem(item) }
                />
                { this.renderCounter(this.state.valueOfCounter) }   
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        width: 300,
        height: 30,
    },
    button: {
        marginTop: 40,
        margin: 20,
        padding: 20,
        backgroundColor: '#ccc',
    },
    button1: {
        marginTop: 10,
        margin: 5,
        padding: 5,
        backgroundColor: '#ccc',
    },
    item1: {
        fontSize: 12,
        textAlign: 'center',
        color: '#333333',
        padding: 5
    },
    item2: {
        fontSize: 8,
        textAlign: 'center',
        color: '#333333',
        padding: 5
    },
    row: {
        margin: 5,
    }
})