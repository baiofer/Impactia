//React imports
import React, { Component } from 'react'

//React native imports
import { Image, Dimensions } from 'react-native'


export default class LogoImage extends Component {
    render() {
        return(
            <Image
                source={ require('../resources/Logo_Impactia.jpg') }
                style={{ width: Dimensions.get('window').width - 50, height: 200, marginBottom: 20 }}
                resizeMode='contain'
            >
            </Image>
        )
    }
}