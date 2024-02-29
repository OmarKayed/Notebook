import { app, database } from './firebase'
import { collection, addDoc, deleteDoc, doc} from 'firebase/firestore'
import React, { useState } from 'react';
import { StyleSheet, Text, FlatList, View, Button, TextInput, StatusBar, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useCollection} from 'react-firebase-hooks/firestore'
import * as ImagePicker from 'expo-image-picker'
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL} from 'firebase/storage'

const Stack = createNativeStackNavigator();

export default function App() {
  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen
          name="Home"
          component={Home}/>
        <Stack.Screen
          name="DetailPage"
          component={DetailPage}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const Home = ({ navigation, route }) => {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState([]);
  const [values, loading, error] = useCollection(collection(database, "notes"))
  const data = values?.docs.map((doc) => ({...doc.data(), id: doc.id}))

  async function saveList() {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(notes));
      await AsyncStorage.setItem('text', text);
    } catch (error) {
      console.error(error);
    }
  }

  const goToDetailPage = (note) => {
    const shortText = note.text.substring(0, 30);
    navigation.navigate("DetailPage", { fullText: note.text});
  };

  async function loadList() {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      const savedText = await AsyncStorage.getItem('text');
      if (savedNotes !== null) {
        setNotes(JSON.parse(savedNotes));
      }
      if (savedText !== null) {
        setText(savedText);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function pressMe () {
     try {
      await addDoc(collection(database, "notes"), {
        text: text
      })
    }catch(err){
        console.log("Fejl i DB" + err)
      }
    }

    async function deleteDocument(id){
      await deleteDoc(doc(database, "notes", id))
    }

    

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setText(text)}
        value={text}
        placeholder="Enter your note here..."
      />
      <Button title="Press Me" onPress={pressMe} />
      <Button title="Save List" onPress={saveList} />
      <Button title="Load List" onPress={loadList} />
      <FlatList
  data={data}
  renderItem={({ item }) => (
    <View>
      <Text>{item.text}</Text>
      <Button title="Delete" onPress={() => deleteDocument(item.id)} />
      <Button title={"Show page"}
             onPress={() => goToDetailPage(item)} 
             />
    </View>
  )}
/>
    </View>
  );
};

const DetailPage = ({ navigation, route }) => {
  const [imagePath, setImagePath] = useState(null);
  const { fullText} = route.params || {};


  async function getPicture() {
    const resultat = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true
    });
    if (!resultat.canceled) {
      console.log("Fået billede..." + resultat.uri);
      setImagePath(resultat.assets[0].uri); // Sætter stien til billedet
    }
  }

  async function uploadPicture() {
    const res = await fetch(imagePath)
    const blob = await res.blob()
    const storageRef = ref(storage, "IMG_5578.png")
    uploadBytes(storageRef, blob).then(() => {
      console.log("Image uploaded");
    })
  }

  async function downloadPicture() {
    await getDownloadURL(ref(storage, "IMG_5578.png"))
    .then((url) => {
    setImagePath(url)
  })
}

  return (
    <View style={styles.container}>
      <Text>{fullText}</Text>
      <Image source={{ uri: imagePath }} style={{ width: 300, height: 300 }} />
      <Button title="get Picture" onPress={getPicture} />
      <Button title="Upload Picture" onPress={uploadPicture} />
      <Button title="Download Picture" onPress={downloadPicture} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    margin: 10,
    width: '80%',
  },
});
