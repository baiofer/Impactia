//React imports
import React, { Component } from 'react'

//React native imports
import { View } from 'react-native'

//Icon imports
import Icon from 'react-native-vector-icons/FontAwesome';

//PropTypes import
import PropTypes from 'prop-types'
  

//Create a dedicated class that will manage the tabBar icon
export default class TabIcon extends Component {

    static propTypes = {
        selected: PropTypes.string,
        iconName: PropTypes.string,
        title: PropTypes.string,
        activeIconColor: PropTypes.string,
        inactiveIconColor: PropTypes.string,
        activeBackgroundColor: PropTypes.string,
        inactiveBackgroundColor: PropTypes.string,
    }

    static defaultProps = {
        activeIconColor: '#830F52',
        inactiveIconColor: '#BEBBBB',
        activeBackgroundColor: '#BEBBBB',
        inactiveBackgroundColor: '#830F52',
    }

    render() {
        const { iconName, colorIcon } = this.props
        return (
            <View 
                style={{ 
                    flex:1, 
                    flexDirection:'column', 
                    alignItems:'center', 
                    alignSelf:'center', 
                    justifyContent: 'center',
                    marginTop: 15,
                }}
            >
                <Icon 
                    name={ iconName || "circle" } 
                    size={ 30 }
                    color={ colorIcon }
                />
            </View>
        );
    }
}