import React from 'react'
import { View, Text } from 'react-native'

const PokemonDetail = ({ route }) => {
    const { pokemon } = route.params
    return <View>
        <Text>Detail {pokemon.name}</Text>
    </View>
}

export default PokemonDetail