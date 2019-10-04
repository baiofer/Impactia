//React imports
import React, { Component } from 'react'
//React native imports
import { Text, View, StyleSheet, FlatList } from 'react-native'
//Imports from Firebase
import * as firebase from 'firebase'



export default class MyMouvements extends Component {

    constructor(props) {
        super(props)
        this.state = {
            readings: [],
        }
    }

    componentDidMount() {
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
            //const read = item.item
            console.log('Select_read: ', read)
            const indexMonth = parseInt(read.fecha.substring(5, 7))
            console.log('Select_indexMonth: ', indexMonth)
            totalsCounter[indexMonth] = {
                counter: totalsCounter[indexMonth].counter + read.contador,
                month: indexMonth
            }
            console.log('Select_totalsCounter[]: ', totalsCounter[indexMonth])
        })
        console.log('Total por meses: ', totalsCounter)
        return totalsCounter
    }

    renderReading(item) {
        console.log('ItemToShow: ', item)
        if (item.item.counter === 0) return null
        return(
            
                <Text style={ styles.textStyle }>{ item.item.month }   { item.item.counter }</Text>
            
        )
    }

    render() {
        const info = this.selectInformation()
        return(
            <View style={ styles.container }>
                <FlatList 
                    style={{ marginTop: 10 }}
                    data={ info }
                    renderItem={ (item) => this.renderReading(item) }
                    extraData={ this.state }
                    keyExtractor={ (item) => item.month.toString() }
                />  
            </View>
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
        backgroundColor: 'blue',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        marginTop: 20,
    },
    textStyle: {
        color: 'black',
    }
})