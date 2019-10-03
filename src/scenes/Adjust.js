//React imports
import React, { Component } from 'react'
//React Native imports
import { StyleSheet, Text, View, NativeEventEmitter, NativeModules, ListView, ActivityIndicator, Alert } from 'react-native'
//Bluetooth imports
import BleManager from 'react-native-ble-manager'
//Imports from Firebase
import firebase from '@firebase/app'
import '@firebase/auth'
import '@firebase/database'
//Components imports
import LogoImage from '../components/LogoImage'
import AppButton from '../components/AppButton'

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => {
    r1 !== r2
}})

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)


export default class Adjust extends Component {
    constructor() {
        super()
        this.state = {
            peripherals: new Map(),
            scanning: false,
            connected: false,
            counterIsReaded: false,
            counterReaded: [],
            valueOfCounter: 0,
            userUid: '',
            systemToRead: '',
            reloadComponent: false,
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

    itemSelected(item) {
        if (this.state.scanning) return null
        const itemToSave = `${item.advertising.localName} \n ${item.id}`
        Alert.alert(
            'Seleccionado sistema',
            itemToSave,
            [{
                text:'OK',
                onPress: () => this.changeReload(item.id),
            }],
        )
    }

    changeReload(item) {
        const reld = !this.state.reloadComponent
        this.setState({
            reloadComponent: reld,
            systemToRead: item
        })
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
        console.log('Item a seleccionar: ', item)
        const color = item.connected ? 'green' : '#FE8000'
        return(
            <View>
                <AppButton
                    bgColor={ color }
                    onPress={ () => this.itemSelected(item)}
                    label='Seleccionar equipo'
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

    renderScanButton(dataSource) {
        if (this.state.systemToRead !== '') {
            return(
                <Text style={{ color: '#FE8000' }}>Ya existe un equipo enlazado { this.state.systemToRead }</Text>
            )
        } else {
            return(
                <View style={ styles.container }>
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
                </View>
            )
        }
    }

    renderListView(dataSource) {
        
        if (this.state.systemToRead === '') {
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
        return(
            <View style={ styles.container }>
                <LogoImage />
                { this.renderScanButton(dataSource) }
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
