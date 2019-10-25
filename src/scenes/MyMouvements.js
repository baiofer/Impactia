//React imports
import React, { Component } from 'react'
//React native imports
import { Text, View, StyleSheet, FlatList, Dimensions } from 'react-native'
//Native base imports
import { Container, Footer, FooterTab, Button } from 'native-base'
//Imports from Firebase
import * as firebase from 'firebase'
import { Actions } from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/FontAwesome'



export default class MyMouvements extends Component {

    constructor(props) {
        super(props)
        this.state = {
            readings: [],
        }
    }

    componentDidMount() {
        console.log('ComponentDidMountMyMouvements')
        //Leer datos de Firebase
        const userId = firebase.auth().currentUser.uid
        firebase.database().ref('Client1/Users/' + userId +'/lecturas').once('value')
            .then( (snapshot) => {                
                const readingsReaded = snapshot.val()
                console.log('Datos: ', readingsReaded)
                const readings = Object.keys(readingsReaded)
                    .map( (key) => {
                        return readingsReaded[key]
                    })
                console.log('Readings: ', readings)
                this.setState({
                    readings: readings,
                })
            })
    }

    selectInformation() {
        //Aqui tratare la informacion para presentarla
        readings = this.state.readings
        console.log('Select_readings: ', readings)
        if (readings === []) return
        var totalsCounter = [{counter: 0, month: 0}, {counter: 0, month: 1}, {counter: 0, month: 2}, {counter: 0, month: 3}, {counter: 0, month: 4}, {counter: 0, month: 5}, {counter: 0, month: 6}, {counter: 0, month: 7}, {counter: 0, month: 8}, {counter: 0, month: 9}, {counter: 0, month: 10}, {counter: 0, month: 11}, {counter: 0, month: 12}]
        readings.forEach( (read) => {
            const indexMonth = parseInt(read.fecha.substring(5, 7))
            totalsCounter[indexMonth] = {
                counter: totalsCounter[indexMonth].counter + read.contador,
                month: indexMonth
            }
        })
        console.log('Total por meses: ', totalsCounter)
        return totalsCounter
    }

    passCounterToHours(value) {
        //We pass the counter to time (days, hours, minutes and seconds)
        const seconds = value % 60
        const minutesLeft = Math.trunc(value / 60)
        const minutes = minutesLeft % 60
        const hours = Math.trunc(minutesLeft / 60)
        return `${ hours } horas ${ minutes } min. ${ seconds } seg.`
    }

    putMonth(month) {
        if (month === '1') return 'ENERO'
        else if (month === '2') return 'FEBRERO'
        else if (month === '3') return 'MARZO'
        else if (month === '4') return 'ABRIL'
        else if (month === '5') return 'MAYO'
        else if (month === '6') return 'JUNIO'
        else if (month === '7') return 'JULIO'
        else if (month === '8') return 'AGOSTO'
        else if (month === '9') return 'SEPTIEMBRE'
        else if (month === '10') return 'OCTUBRE'
        else if (month === '11') return 'NOVIEMBRE'
        else if (month === '12') return 'DICIEMBRE'
        else  return 'ERROR MES'
    }

    renderReading(item) {
        if (item.item.counter === 0) return null
        const timeCounter = this.passCounterToHours(item.item.counter)
        return(
            <View style={ styles.item }>
                <Text style={ styles.text1Style }>Mes:  { this.putMonth(item.item.month.toString()) }</Text>
                <Text style={ styles.text2Style }>   { timeCounter }</Text>
            </View>
                
        )
    }

    renderTabBar() {
        return(
            <Footer>
                <FooterTab>
                    <Button 
                        vertical
                        onPress={ () => Actions.reset('ReadCounter') }
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
                        //onPress={ () => Actions.replace('MyMouvements') }
                    >
                        <Icon 
                            name='list' 
                            style={{ color: 'grey' }}
                            size={ 30 }
                        />
                        <Text style={{ color: 'grey', fontSize: 12 }}>Movimientos</Text>
                    </Button>
                    <Button 
                        vertical
                        onPress={ () => Actions.reset('Adjust') }
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
        const info = this.selectInformation()
        return(
            <Container style={ styles.container }>
                <View style={ styles.container }>
                    <FlatList 
                        style={{ marginTop: 10 }}
                        data={ info }
                        renderItem={ (item) => this.renderReading(item) }
                        extraData={ this.state }
                        keyExtractor={ (item) => item.month.toString() }
                    /> 
                </View>
                { this.renderTabBar() } 
            </Container>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        height: 30,
    },
    item: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        height: 70,
        marginTop: 5,
        borderColor: '#FE8000',
        borderRadius: 5,
        borderWidth: 1,
        width: 300,
    },
    text1Style: {
        color: '#FE8000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    text2Style: {
        color: '#FE8000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    tabBarContainer: {
        flex: 1,
        flexDirection: 'row',
        marginBottom: 5,
    },
})