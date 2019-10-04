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

    renderReading(item) {
        console.log('renderReading: ', item)
        const reading = item.item
        return(
            <View style={ styles.container }>
                <Text style={ styles.textStyle }>{ reading.fecha }</Text>
                <Text style={ styles.textStyle }>{ reading.hora }</Text>
                <Text style={ styles.textStyle }>{ reading.contador }</Text>
            </View>
        )
    }

    render() {
        return(
            <View style={ styles.container }>
                <FlatList 
                    style={{ marginTop: 10 }}
                    data={ this.state.readings }
                    renderItem={ (item) => this.renderReading(item) }
                    extraData={ this.state }
                    keyExtractor={ (item) => item.hora }
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
})