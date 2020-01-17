import React, { useState } from 'react'
import { View, Text, ActivityIndicator, StyleSheet, FlatList, Dimensions, Image } from 'react-native'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import CardView from 'react-native-cardview'

const { width } = Dimensions.get('window')

const getBackgroundColor = (types) => {
    const type = types[0]
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

const query = gql`
    query ($limit: Int!) {
        pokemons(first: $limit) {
            name
            image
            types 
        }
    }
`

const BuildListItem = ({ item }) => {
    return <View style={styles.listItemContainer}>
        <CardView
            style={styles.cardContainer}
            cardElevation={3}
            cardMaxElevation={2}
            cornerRadius={15}>
            <View>
                <Text style={styles.pokemonName}>{item.name}</Text>
                <View style={[styles.typeContainer, { backgroundColor: getBackgroundColor(item.types) }]}>
                    <Text style={styles.type}>{item.types[0]}</Text>
                </View>
                {item.types.length > 1 ? <View style={[styles.typeContainer, { backgroundColor: getBackgroundColor(item.types) }]}>
                    <Text style={styles.type}>{item.types[1]}</Text>
                </View> : null}
            </View>
            <Image style={styles.pokemonImage
            } source={{ uri: item.image }} />
        </CardView>
    </View>
}

const BuildLoading = () => {
    return <View style={styles.loadingContainer}><ActivityIndicator /></View>
}

const BuildList = ({ data, fetchMore, limit, setLimit, isLoadingMore, setLoadingMore }) => {
    return <FlatList
        data={data}
        numColumns={2}
        renderItem={({ item }) => <BuildListItem item={item} />}
        keyExtractor={(_, index) => index.toString()}
        onEndReached={() => {
            setLimit(limit + 10)
            setLoadingMore(true)
            fetchMore({
                variables: {
                    limit: limit + 10
                },
                updateQuery: (prev, { fetchMoreResult }) => {
                    // console.log({ prev, fetchMoreResult })
                    setLoadingMore(false)
                    if (!fetchMoreResult) return prev;
                    return Object.assign({}, prev, {
                        pokemons: [...fetchMoreResult.pokemons]
                    });
                }
            })
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={() => isLoadingMore ? <BuildLoading /> : null}
    />
}

const PokemonList = () => {

    const [limit, setLimit] = useState(10)
    const [isLoadingMore, setLoadingMore] = useState(false)

    return <Query query={query} variables={{
        limit: 10
    }}>
        {(response) => {
            // console.log(response)
            if (response.loading) {
                return <View style={styles.loadingContainer}><ActivityIndicator /></View>
            } else if (response.error) {
                return <View style={styles.container}>
                    <Text>Terjadi Kesalahan, mohon coba kembali</Text>
                </View>
            }
            return <View style={styles.container}>
                <BuildList data={response.data.pokemons} fetchMore={response.fetchMore} setLimit={setLimit} limit={limit} isLoadingMore={isLoadingMore} setLoadingMore={setLoadingMore} />
            </View>
        }}
    </Query>
}

export default PokemonList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ffffff'
    },
    listItemContainer: {
        flex: 1,
        margin: 10,
        borderRadius: 15
    },
    cardContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },
    pokemonImage: {
        height: width / 2.5,
        width: width / 5,
        resizeMode: 'contain'
    },
    typeContainer: {
        marginTop: 10,
        padding: 5,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    pokemonName: {
        marginTop: 5,
        fontSize: 16,
        fontWeight: 'bold'
    },
    type: {
        color: '#fff',
        marginHorizontal: 10
    },
    loading: {
        marginVertical: 50,
        height: 150,
        width,
        justifyContent: 'center',
        alignItems: 'center'
    }
})