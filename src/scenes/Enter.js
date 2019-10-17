//React imports
import React, { Component } from 'react'
//React Native imports
import { StyleSheet, View } from 'react-native'
//Components imports
import BackgroundImage from '../components/BackgroundImage'
import LogoImage from '../components/LogoImage'
import AppButton from '../components/AppButton'
//React Native Router Flux imports
import { Actions } from 'react-native-router-flux'




export default class Enter extends Component {

    //Functions
    enter() {
        Actions.ReadCounter()
    }

    //Renders
    render() {
        return(
            <BackgroundImage>
                <View style={ styles.container }>
                    <LogoImage />
                    <AppButton
                        bgColor='#FE8000'
                        onPress={ () => this.enter()}
                        label='Enter app'
                        labelColor='white'
                        iconColor='white'
                    />
                </View>
            </BackgroundImage>
        )
    }
}

//Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
});