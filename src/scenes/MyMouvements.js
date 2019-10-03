//React imports
import React, { Component } from 'react'
//React native imports
import { Text, View, StyleSheet } from 'react-native'
//Components imports
import LogoImage from '../components/LogoImage'


export default class MyMouvements extends Component {

    render() {
        return(
            <View style={ styles.container }>
                <LogoImage />
                <Text>MIS MOVIMIENTOS</Text>   
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