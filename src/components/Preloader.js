//React imports
import React, { Component } from 'react'
//React native imports
import { ActivityIndicator, View, StyleSheet, Dimensions } from 'react-native'
//Components imports
import LogoImage from '../components/LogoImage'
import * as Utils from '../utils'

const { height } = Dimensions.get('window')


export default class Preloader extends Component {
    render() {
        return(
            <View style={ styles.preloader }>
                <LogoImage/>
                <ActivityIndicator 
                    style={{ height: 80 }} 
                    size='large' 
                    color={ Utils.Constants.buttonBackgroundColor }
                />
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
        backgroundColor: 'white'
    }
})