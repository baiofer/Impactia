//React imports
import React, { Component } from 'react'
//React native imports
import { ActivityIndicator, View, StyleSheet, Dimensions } from 'react-native'
import LogoImage from '../components/LogoImage'

const { height } = Dimensions.get('window')


export default class Preloader extends Component {
    render() {
        return(
            <View style={ styles.preloader }>
                <LogoImage/>
                <ActivityIndicator style={{ height: 80 }} size='large' />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    preloader: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: height,
        backgroundColor: '#242935'
    }
})