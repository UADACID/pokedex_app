import React, { useState, useRef, useEffect } from 'react'
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    FlatList,
    Dimensions,
    Image,
    TouchableOpacity
} from 'react-native'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import CardView from "react-native-cardview"
import { useNavigation } from '@react-navigation/native'
import FAB from 'react-native-fab'
import Icon from 'react-native-vector-icons/Feather'
import RBSheet from "react-native-raw-bottom-sheet"

const { width, height } = Dimensions.get('window')

String.prototype.capitalize = function () {
    return this.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
};

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

const query = gql`
    query ($limit: Int!) {
        pokemons(first: $limit) {
            name
            image
            types
            number
        }
    }
`

const BuildListItem = ({ item }) => {
    const navigation = useNavigation()
    return <TouchableOpacity activeOpacity={1} style={styles.listItemContainer} onPress={() => navigation.navigate('PokemonDetail', {
        pokemon: item
    })}>
        <CardView
            style={styles.cardContainer}
            cardElevation={3}
            cardMaxElevation={2}
            cornerRadius={15}>
            <View>
                <Text style={styles.pokemonName}>{item.name}</Text>
                <View style={[styles.typeContainer, { backgroundColor: getBackgroundColor(item.types[0]) }]}>
                    <Text style={styles.type}>{item.types[0]}</Text>
                </View>
                {item.types.length > 1 ? <View style={[styles.typeContainer, { backgroundColor: getBackgroundColor(item.types[1]) }]}>
                    <Text style={styles.type}>{item.types[1]}</Text>
                </View> : null}
            </View>
            <Image style={styles.pokemonImage
            } source={{ uri: item.image }} />
        </CardView>
    </TouchableOpacity>
}

const BuildLoading = () => {
    return <View style={styles.loading}><ActivityIndicator /></View>
}

const HeaderTitle = () => {
    return <Text style={styles.headerTitle}>Pokedex</Text>
}

const BuildList = ({ filterType, data, fetchMore, loading, limit, setLimit, isLoadingMore, setLoadingMore, refetch }) => {

    const filterPokemonByType = data.filter((item) => {
        if (filterType == '') {
            return item
        }
        const isHasType = item.types.filter((t) => t === filterType)
        if (isHasType.length > 0) {
            return item
        }
    })
    return <FlatList
        data={filterPokemonByType}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        renderItem={({ item }) => <BuildListItem item={item} />}
        keyExtractor={(_, index) => index.toString()}
        onEndReached={() => {
            setLimit(limit + 10)
            if (!isLoadingMore) {
                setLoadingMore(true)
                fetchMore({
                    variables: {
                        limit: limit + 10
                    },
                    updateQuery: (prev, { fetchMoreResult }) => {
                        setLoadingMore(false)
                        if (!fetchMoreResult) return prev;
                        return Object.assign({}, prev, {
                            pokemons: [...fetchMoreResult.pokemons]
                        });
                    }
                })
            }

        }}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={() => <HeaderTitle />}
        ListFooterComponent={() => isLoadingMore && filterPokemonByType.length > 10 ? <BuildLoading /> : null}
    />
}

const BuildFilterView = ({ listType, filterType, setFilterType, refRBSheet }) => {
    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.filterTitle}>Select Pokemon Type</Text>
            <View style={styles.filterContainer}>
                {
                    listType.length > 0 && listType.map((item, index) => {
                        const typeName = item.name.capitalize()
                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    setFilterType(typeName)
                                    refRBSheet.current.close()
                                }}
                                style={[styles.filterItem, { backgroundColor: filterType == typeName ? '#3498db' : null }]} key={index}>
                                <Text style={[styles.filterItemTitle, { color: filterType == typeName ? '#ffffff' : null }]}>{typeName}</Text>
                            </TouchableOpacity>
                        )
                    })
                }
                <TouchableOpacity
                    onPress={() => {
                        setFilterType('')
                        refRBSheet.current.close()
                    }}
                    style={[styles.filterItem, { backgroundColor: filterType == '' ? '#3498db' : null }]}>
                    <Text style={styles.filterItemTitle}>RESET</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const PokemonList = () => {
    const [limit, setLimit] = useState(10)
    const [isLoadingMore, setLoadingMore] = useState(false)
    const [filterType, setFilterType] = useState('')
    const refRBSheet = useRef()
    const { loading, error, data, fetchMore, refetch } = useQuery(query, {
        variables: { limit: 30 },
    });

    const [listType, setListType] = useState([])

    async function getMoviesFromApi() {
        try {
            let response = await fetch(
                'https://pokeapi.co/api/v2/type',
            );
            let responseJson = await response.json();
            setListType(responseJson.results)
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getMoviesFromApi()
    }, [])

    const buildContent = () => {
        if (loading) {
            return <View style={styles.loadingContainer}><ActivityIndicator /></View>
        } else if (error) {
            return <View style={styles.container}>
                <Text>Terjadi Kesalahan, mohon coba kembali</Text>
            </View>
        }
        return <View style={styles.container}>
            <Image resizeMode="contain"
                style={styles.backgroundImage}
                source={{ uri: 'https://i.ya-webdesign.com/images/pokeball-icon-png-14.png' }}
            />
            <View style={styles.foregroundContainer}>
                <BuildList
                    filterType={filterType}
                    data={data.pokemons}
                    loading={loading}
                    fetchMore={fetchMore}
                    setLimit={setLimit}
                    limit={limit}
                    isLoadingMore={isLoadingMore}
                    setLoadingMore={setLoadingMore}
                    refetch={refetch}
                />
            </View>
        </View>
    }

    return <View style={styles.stackContainer}>
        {buildContent()}
        <FAB
            buttonColor="#6D7AD9"
            iconTextColor="#FFFFFF"
            onClickAction={() => {
                refRBSheet.current.open()
            }}
            visible={!loading}
            iconTextComponent={<Icon name="sliders" size={30} color="#900" />}
        />
        <RBSheet
            ref={refRBSheet}
            closeOnDragDown={true}
            closeOnPressMask={true}
            height={height * 0.75}
            animationType="fade"
            customStyles={{
                draggableIcon: {
                    backgroundColor: "#000"
                }
            }}
        >
            <BuildFilterView
                listType={listType}
                filterType={filterType}
                setFilterType={setFilterType}
                refRBSheet={refRBSheet}
            />
        </RBSheet>
    </View>

}

export default PokemonList;

const styles = StyleSheet.create({
    stackContainer: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    backgroundImage: {
        opacity: 0.1,
        width,
        height: height / 1,
        position: 'absolute',
        right: - (width / 5),
        top: - (width / 1.63)
    },
    foregroundContainer: {
        position: 'absolute',
        width,
        height,
        top: 0,
        left: 0,
    },
    container: {
        flex: 1,
        paddingHorizontal: 10
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
        height: 100,
        width,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 35,
        fontWeight: 'bold',
        marginTop: width / 6,
        marginBottom: 25,
        marginLeft: 10
    },
    filterItem: {
        borderRadius: 20,
        backgroundColor: '#ffffff',
        padding: 5,
        borderWidth: 1,
        borderColor: 'gray',
        width: 100,
        marginHorizontal: 5,
        marginVertical: 10,
        alignItems: 'center',

    },
    filterContainer: {
        flex: 1,
        marginTop: 20,
        justifyContent: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    filterTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    filterItemTitle: {
    }
})