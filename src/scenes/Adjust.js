//React imports
import React, { Component } from 'react'
//React Native imports
import { StyleSheet, Text, View, NativeEventEmitter, NativeModules, ListView, ActivityIndicator, Alert, Dimensions } from 'react-native'
//Native base imports
import { Container, Footer, FooterTab, Button } from 'native-base'
//Bluetooth imports
import BleManager from 'react-native-ble-manager'
//Imports from Firebase
import firebase from '@firebase/app'
import '@firebase/auth'
import '@firebase/database'
//Components imports
import LogoImage from '../components/LogoImage'
import AppButton from '../components/AppButton'
//Utils imports
import * as Utils from '../utils'
import { Actions } from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/FontAwesome'

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => {
    r1 !== r2
}})

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)


export default class Adjust extends Component {

    constructor(props) {
        super(props)
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
        await Utils.PersistData.getBLEIsConnect()
            .then( (bleIsConnect) => {
                console.log('bleIsConnect: ', bleIsConnect)
                if (bleIsConnect === '0') {
                    BleManager.start({ showAlert: false })
                        .then( () => {
                            console.log('Módulo Adjust inicilizado')
                            Utils.PersistData.setBLEIsConnect('1')
                    })
                }  
            })
        this.handleDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral.bind(this))

        this.handleStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan.bind(this))

        this.handleDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral.bind(this))
        
        //Cojemos el sistema a leer y el userUid desde AsyncStorage
        Utils.PersistData.getSystemToRead()
            .then( (value) => {
                if (value !== 'none' || value !== '') {
                    this.setState({
                        systemToRead: value,
                    })
                    console.log('SystemToReadInAdjust: ', this.state.systemToRead)
                }
            })
        Utils.PersistData.getUserUid()
            .then( (value) => {
                if (value !== 'none' || value !== '') {
                    this.setState({
                        userUid: value,
                    })
                    console.log('UserUidInAdjust: ', this.state.userUid)
                }
            })
    }

    componentWillUnmount() {
        this.handleDiscover.remove()
        this.handleStop.remove()
        this.handleDisconnect.remove()
        //this.handleUpdate.remove()
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
        Utils.PersistData.setSystemToRead(item)
    }

    //We look for only the client sistem.
    lookForBikeElement(data) {
        if (data === []) return []
        console.log('Lista: ', data)
        let newList = []
        data.forEach( (element) => {
            if (element.advertising.localName === 'BIKE' || element.name === 'Arduino') {
                newList.push(element)
                console.log('pushed element: ', element)
            }
        })
        return newList
    }

    removeSystem() {
        Utils.PersistData.setSystemToRead('')
        this.setState({
            systemToRead: ''
        })
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
        const labelItem = `Seleccionar equipo - ${item.id.substring(0, 8)}`
        console.log('Item a seleccionar: ', item)
        const color = item.connected ? 'green' : '#FE8000'
        return(
            <View>
                <AppButton
                    bgColor={ color }
                    onPress={ () => this.itemSelected(item)}
                    label={ labelItem }
                    labelColor='white'
                    iconColor='white'
                />
                { this.renderActivity(item) }
            </View>
            
        )
    }

    renderScanButton(dataSource) {
        const { systemToRead } = this.state
        if (systemToRead === '') {
            console.log('STR: ', systemToRead)
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
        } else {
            console.log('STR: ', systemToRead)
            return(
                <View>
                    <Text style={{ color: '#FE8000', marginBottom: 20 }}>Ya existe un equipo enlazado { systemToRead }</Text>
                    <AppButton
                        bgColor='#FE8000'
                        onPress={ () => this.removeSystem()}
                        label='Desenlazar equipo'
                        labelColor='white'
                        iconColor='white'
                    />
                </View>
            )
        }
    }

    renderTabBar() {
        return(
            <Footer>
                <FooterTab>
                    <Button 
                        vertical
                        onPress={ () => Actions.ReadCounter() }
                    >
                        <Icon 
                            name='bicycle' 
                            style={{ color: '#FE8000' }}
                            size={ 30 }
                        />
                        <Text style={{ color: '#FE8000', fontSize: 12 }}>Contador</Text>
                    </Button>
                    <Button 
                        vertical
                        onPress={ () => Actions.reset('MyMouvements') }
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
                        //onPress={ () => Actions.replace('Adjust') }
                    >
                        <Icon 
                            name='wrench' 
                            style={{ color: 'grey' }}
                            size={ 30 }
                        />
                        <Text style={{ color: 'grey', fontSize: 12 }}>Ajustes</Text>
                    </Button>
                </FooterTab>
            </Footer>
        )
    }

    render() {
        const list = Array.from(this.state.peripherals.values())
        //Look for element to connect
        const newList = this.lookForBikeElement(list)
        const dataSource = ds.cloneWithRows(newList)
        console.log('Array: ', list)
        console.log('NewList: ', newList)
        return(
            <Container style={ styles.container }> 
                <View style={ styles.container }>
                    <LogoImage />
                    { this.renderScanButton(dataSource) }
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
    tabBarContainer: {
        flex: 1,
        flexDirection: 'row',
        marginBottom: 5,
    },
})
