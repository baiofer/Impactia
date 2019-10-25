import AsyncStorage from '@react-native-community/async-storage';

//Persist Data functions
//USER UID
export const getUserUid = async () => {
    let userUid = ''
    try {
      userUid = await AsyncStorage.getItem('userUid') || ''
    } catch (error) {
      console.log('ErrorGetUserUid: ', error.message)
    }
    return userUid
}
  
export const setUserUid = async (userUid) => {
    try {
      await AsyncStorage.setItem('userUid', userUid)
    } catch (error) {
      console.log('ErrorSetUserUid: ', error.message)
    }
}

export const removeUserUid = async () => {
  try {
    await AsyncStorage.removeItem('userUid')
  } catch (error) {
    console.log('ErrorRemoveUserUid: ', error.message)
  }
}
  
//USER LOGGED
export const getUserLogged = async () => {
    let userLogged = ''
    try {
      userLogged = await AsyncStorage.getItem('userLogged') || ''
    } catch (error) {
      console.log('ErrorGetUserLogged: ', error.message)
    }
    return userLogged
}
  
export const setUserLogged = async (userLogged) => {
    try {
      await AsyncStorage.setItem('userLogged', userLogged)
    } catch (error) {
      console.log('ErrorSetUserLogged: ', error.message)
    }
}

export const removeUserLogged = async () => {
    try {
      await AsyncStorage.removeItem('userLogged')
    } catch (error) {
      console.log('ErrorRemoveUserLogged: ', error.message)
    }
}

//SYSTEM TO READ
export const getSystemToRead = async () => {
    let systemToRead = ''
    try {
      systemToRead = await AsyncStorage.getItem('systemToRead') || ''
    } catch (error) {
      console.log('ErrorGetSystemToRead: ', error.message)
    }
    return systemToRead
}

export const setSystemToRead = async (systemToRead) => {
    try {
      await AsyncStorage.setItem('systemToRead', systemToRead)
    } catch (error) {
      console.log('ErrorSetSystemToRead: ', error.message)
    }
}

export const removeSystemToRead = async () => {
    try {
      await AsyncStorage.removeItem('systemToRead')
    } catch (error) {
      console.log('ErrorRemoveSystemToRead: ', error.message)
    }
}

//CONNEXION OF BLE
export const getBLEIsConnect = async () => {
  let bleIsConnect = ''
  try {
    bleIsConnect = await AsyncStorage.getItem('bleIsConnect') || ''
  } catch (error) {
    console.log('ErrorGetBLEIsConnect: ', error.message)
  }
  return bleIsConnect
}

export const setBLEIsConnect = async (bleIsConnect) => {
  try {
    await AsyncStorage.setItem('bleIsConnect', bleIsConnect)
  } catch (error) {
    console.log('ErrorSetBLEIsConnect: ', error.message)
  }
}

export const removeBLEIsConnect = async () => {
  try {
    await AsyncStorage.removeItem('bleIsConnect')
  } catch (error) {
    console.log('ErrorRemoveBLEIsConnect: ', error.message)
  }
}

  //LANGUAGE
export const getLanguage = async () => {
  let language = ''
  try {
    language = await AsyncStorage.getItem('language') || ''
  } catch (error) {
    console.log('ErrorGetLanguage: ', error.message)
  }
  return language
}

export const setLanguage = async (language) => {
  try {
    await AsyncStorage.setItem('language', language)
  } catch (error) {
    console.log('ErrorSetLanguage: ', error.message)
  }
}

export const removeLanguage = async () => {
  try {
    await AsyncStorage.removeItem('language')
  } catch (error) {
    console.log('ErrorRemoveLanguage: ', error.message)
  }
}