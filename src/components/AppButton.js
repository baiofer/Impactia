//React imports
import React, { Component } from 'react'
//React native imports
import { TouchableOpacity, Text, Dimensions, View } from 'react-native'
//Icon imports
import Icon from 'react-native-vector-icons/FontAwesome';
//PropTypes imports
import PropTypes from 'prop-types'


export default class AppButton extends Component {

    static propTypes = {
        bgColor: PropTypes.string,
        label: PropTypes.string,
        labelColor: PropTypes.string,
        setWidth: PropTypes.number,
        iconName: PropTypes.string,
        iconColor: PropTypes.string,
        onPress: PropTypes.func,
        buttonStyle: PropTypes.object,
        fontSize: PropTypes.number,
    }

    static defaultProps = {
        bgColor: 'white',
        label: 'Button',
        labelColor: 'black',
        onPress: () => {},
        fontSize: 15,
    }

    _onPress() {
        this.props.onPress()
    }

    //RENDER
    render() {
        const { bgColor, onPress, label, labelColor, setWidth, iconName, iconColor, buttonStyle, fontSize } = this.props
        const width = !setWidth ? Dimensions.get('window').width - 20 : setWidth
        return (
            <TouchableOpacity 
                style={[{
                    backgroundColor: bgColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10,
                    height: 50,
                    borderColor: "transparent",
                    borderWidth: 0,
                    borderRadius: 25,
                    marginBottom: 10,
                    width: width,
                }, buttonStyle]} 
                onPress={ onPress }
            >
                <View 
                    style={{ 
                        flexDirection: 'row', justifyContent: 'space-between' }}
                >
                    <Icon
					    name={ iconName }
					    size={ 15 }
					    color={ iconColor }
                    />   
                    <Text 
                        style={{
                            color: labelColor,
                            fontSize: fontSize,
                            marginLeft: 10 }}
                    >
                        { label }
                    </Text>
                </View>            
            </TouchableOpacity>
        )
    }
}