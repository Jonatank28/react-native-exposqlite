import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableHighlight } from 'react-native';
import * as SQLite from 'expo-sqlite';
import NetInfo from '@react-native-community/netinfo';

interface productTypes {
  id: number;
  name: string;
}[]

const Page = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [productName, setProductName] = useState('');
  const [products, setProducts] = useState<productTypes>([]);

  const createTable = async () => {
    const db = await SQLite.openDatabaseAsync('databaseName');
    const result = await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS product (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL);
    
`);
    // if (!result) {
    //   await db.runAsync('DELETE FROM product');
    // }
    // console.log("🚀  result", result);

  }

  const addProduct = async () => {
    const db = await SQLite.openDatabaseAsync('databaseName');
    const result = await db.runAsync('INSERT INTO product (name) VALUES (?)', [productName]);
    setProductName('');
    getProducts();
  }

  const remove = async (id: number) => {
    const db = await SQLite.openDatabaseAsync('databaseName');
    const result = await db.runAsync('DELETE FROM product WHERE id = ?', [id]);
    getProducts();
  }

  const getProducts = async () => {
    const db = await SQLite.openDatabaseAsync('databaseName');
    const result = await db.getAllAsync('SELECT * FROM product');
    setProducts(result);

  }

  useEffect(() => {
    createTable();
    getProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    // Verifica a conexão inicial
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });

    // Limpa o listener ao desmontar
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>{isConnected ? 'Conectado à Internet' : 'Sem Conexão com a Internet'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do produto"
        value={productName}
        onChangeText={setProductName}
      />
      <Button
        title="Adicionar Produto"
        onPress={addProduct}
      />
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text>{item.name}</Text>
              <TouchableHighlight onPress={() => remove(item.id)} style={{ backgroundColor: 'red', padding: 2 }}>
                <Text>Remover</Text>
              </TouchableHighlight>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
});
