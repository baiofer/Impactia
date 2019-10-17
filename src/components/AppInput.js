//React imports
import React, { Component } from 'react'
//React native imports
import { View, Text, StyleSheet, TextInput, Dimensions } from 'react-native'
//PropTypes imorts
import PropTypes from 'prop-types'


export default class AppInput extends Component {

    static propTypes = {
        labelStyle: PropTypes.object,
        inputStyle: PropTypes.object,
        errorStyle: PropTypes.object,
        label: PropTypes.string,
        value: PropTypes.string,
        error: PropTypes.string,
        placeholder: PropTypes.string,
        onChangeText: PropTypes.func,
        isPassword: PropTypes.bool,
        keyboardType: PropTypes.string,
    }

    static defaultProps = {
        labelStyle: {},
        inputStyle: {},
        errorStyle: {},
        placeholder: 'Text input',
        onChangeText: () => {},
        isPassword: false,
        keyboardType: 'default',
    }

    //RENDER
    render() {
        const { labelStyle, label, value, onChangeText, placeholder, inputStyle, error, errorStyle, isPassword, keyboardType } = this.props
        return (
            <View style={ styles.container }>
                { label ? 
                    <Text 
                        style= { [styles.label, labelStyle] }
                    >
                        { label }
                    </Text> : null
                }
                <TextInput
                    value={ value }
                    onChangeText={ (v) => onChangeText(v) }
                    placeholder={ placeholder }
                    placeholderTextColor={ 'grey' }
                    autoCapitalize='none'
                    style={ 
                        [styles.input, inputStyle] }
                    underlineColorAndroid={ 'transparent' }
                    secureTextEntry={ isPassword }
                    keyboardType={ keyboardType }
                />
                { error ? 
                    <Text 
                        style={ [styles.error, errorStyle] }
                    >
                        { error }
                    </Text> 
                    : null 
                }
            </View>
        )
    }
}

//ESTILOS
const styles = StyleSheet.create({
    container: {
    },
    
    error: {
        color: '#830f52',
        textAlign: 'right',
        marginTop: 4,
    },

    input: {
        backgroundColor: '#BEBBBB',
        fontSize: 16,
        color: '#2F243A',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        height: 50,
        borderColor: "transparent",
        borderWidth: 0,
        borderRadius: 25,
        marginBottom: 10,
        width: Dimensions.get('window').width - 20,
    },

    label: {
        color: '#BEBBBB',
        fontSize: 16,
        marginBottom: 10,
        fontWeight: '600',
    },
})