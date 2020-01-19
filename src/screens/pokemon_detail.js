import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    Dimensions, 
    Image, 
    ActivityIndicator,
    Platform
} from 'react-native'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();


const { width, height } = Dimensions.get('window')

const query = gql`
    query ($name: String!) {
        pokemon(name:$name) {
            number
            name
            classification
            image
            types
            resistant
            weaknesses
            evolutions {
                name
                image
                types
                number
            }
          }
        }
    
`

const getBackgroundColor = (type) => {
    if (type === "Water") {
        return '#78BDFF'
    } else if (type === "Grass") {
        return '#49D0B1'
    } else if (type === "Fire") {
        return '#FC6C6E'
    } else if (type === "Poison") {
        return '#8e44ad'
    } else if (type === "Normal") {
        return '#6C7A89'
    }
    else {
        return '#F5D76E'
    }
}

const BuildTypeAndClasification = ({ pokemon, datafromServer, loading }) => {
    return (
        <View style={styles.containerType}>
            <View style={styles.types}>
                {
                    pokemon.types.map((item, index) => {
                        return (
                            <View key={index} style={[styles.typeContainer, { backgroundColor: getBackgroundColor(item) }]}>
                                <Text style={styles.type}>{item}</Text>
                            </View>
                        )
                    })
                }
            </View>
            {loading ? null : <Text style={styles.classification}>{datafromServer.pokemon.classification}</Text>}
        </View>
    )
}

const BuildImage = ({ image }) => {
    return (
        <View>
            <Image resizeMode="contain" style={styles.pokemonImage} source={{ uri: image }} />
        </View>
    )
}

const BuildResistant = ({ resistant }) => {
    
    return (
        <View style={styles.resistantContainer}>
            {
                resistant.map((item, index) => {
                    return (
                        <View style={styles.resistantItemContainer} key={index}>
                            <Text style={styles.resistantText}>{item}</Text>
                        </View>
                    )
                })
            }
        </View>
    )
}

const BuildWeaknesses = ({ weaknesses }) => {
    return (
        <View style={styles.resistantContainer}>
            {
                weaknesses.map((item, index) => {
                    return (
                        <View style={styles.weaknessItemContainer} key={index}>
                            <Text style={{ color: '#8e44ad'}}>{item}</Text>
                        </View>
                    )
                })
            }
        </View>
    )
}

const BuildEvolutions = ({ pokemon }) => {
    return (
        <View style={styles.evolutionContainer}>
            {
                pokemon.evolutions.map((evolution, index) => {
                    return (
                        <View key={index}>
                            <Image resizeMode="contain" style={styles.evolutionImage} source={{ uri: evolution.image }} />
                            <Text style={styles.evolutionName}>{evolution.name}</Text>
                        </View>
                    )
                })
            }
        </View>
    )
}

const PokemonDetail = ({ route }) => {
    const { pokemon } = route.params
    const { loading, error, data } = useQuery(query, {
        variables: { name: pokemon.name },
    });

    return (
        <View style={styles.container}>
            <View style={styles.nameContainer}>
                <Text style={styles.pokemonName}>{pokemon.name}</Text>
                <Text style={styles.pokemonNumber}>#{pokemon.number}</Text>
            </View>
            <BuildTypeAndClasification pokemon={pokemon} datafromServer={data} loading={loading} />
            <BuildImage image={pokemon.image} />
            {loading ? <View style={styles.loadingContainer}>
                <ActivityIndicator />
            </View> : (error ? null : <Tab.Navigator>
                {data.pokemon.evolutions == null ? null : <Tab.Screen name="evolutions" component={() => <BuildEvolutions pokemon={data.pokemon} />} />}
                <Tab.Screen name="resistant" component={() => <BuildResistant resistant={data.pokemon.resistant} />} />
                <Tab.Screen name="weaknesses" component={() => <BuildWeaknesses weaknesses={data.pokemon.weaknesses} />} />
            </Tab.Navigator>)}
        </View>
    )
}

export default PokemonDetail


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: Platform.OS == 'ios' ? 150 : 100,
        alignItems: 'flex-end',
    },
    pokemonName: {
        fontSize: 25,
        fontWeight: 'bold',
    },
    pokemonNumber: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    containerType: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingHorizontal: 20,
    },
    pokemonImage: {
        width: width / 2.5,
        height: width / 2.5,
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 20
    },
    typeContainer: {
        marginTop: 10,
        marginRight: 10,
        padding: 5,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    type: {
        color: '#fff',
        marginHorizontal: 10
    },
    classification: {
        marginTop: 10
    },
    types: {
        flexDirection: 'row'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    evolutionContainer: {
        flexDirection: 'row',
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    evolutionImage: {
        width: width / 3.5,
        height: width / 3.5
    },
    evolutionName: {
        alignSelf: 'center',
        fontWeight: 'bold'
    },
    resistantContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#ffff',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    resistantItemContainer: {
        width: width / 3.5,
        height: width / 3.5,
        borderRadius: 5,
        margin: 5,
        backgroundColor: '#4fc3f7',
        justifyContent: 'center',
        alignItems: 'center'
    },
    resistantText: {
        fontSize: 16,
        color: '#ffffff'
    },
    weaknessItemContainer: {
        width: width / 3.5,
        height: width / 3.5,
        borderRadius: 5,
        margin: 5,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center'
    }
})