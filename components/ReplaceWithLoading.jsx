import React from 'react'
import { useContext } from 'react'
import { dataContext } from '../context/dataContext'
import { ActivityIndicator } from 'react-native'

export default function ReplaceWithLoading({children}) {
    const {loading} = useContext(dataContext)
  return (
    <>
        {loading && <ActivityIndicator size="large" color="#64CCC5" />}

        {!loading && children}
    </>
  )
}
