import * as React from 'react';
import { View, Text, Button } from 'react-native';
import { NavigationNativeContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { ApolloProvider } from 'react-apollo';
//import ApolloClient, InMemoryCache, and HttpLink to define your client to cnnect to your graphql server.//#endregion
import { ApolloClient, InMemoryCache, HttpLink } from 'apollo-client-preset';
import PokemonList from './src/screens/pokemon_list'
import PokemonDetail from './src/screens/pokemon_detail'

const client = new ApolloClient({
  //Assign to your cache property a instance of a InMemoryCache
  cache: new InMemoryCache(),
  //Assign your link with a new instance of a HttpLink linking to your graphql server.
  link: new HttpLink({
    uri: 'https://graphql-pokemon.now.sh'
  })
})


const Stack = createStackNavigator();

function App() {
  return (
    <NavigationNativeContainer>
      <ApolloProvider client={client}>
      <Stack.Navigator>
        <Stack.Screen name="PokemonList" component={PokemonList} options={{ headerShown: false }} />
        <Stack.Screen name="PokemonDetail" component={PokemonDetail} />

      </Stack.Navigator>
      </ApolloProvider>
    </NavigationNativeContainer>
  );
}

export default App;