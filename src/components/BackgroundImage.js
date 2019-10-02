//React imports
import React, { Component } from 'react'

//React native imports
import { View } from 'react-native'

//PropTypes imports
import PropTypes from 'prop-types'


export default class BackgroundImage extends Component {

    static propTypes = {
        backgroundColor: PropTypes.string,
    }

    static defaultProps = {
        backgroundColor:  'white',
    }

    render() {
        const { source, children } = this.props
        return(
            <View
            style={{ flex: 1, width: null, height: null, backgroundColor: this.props.backgroundColor }}
            >
                { children }
            </View>
        )
    }
}