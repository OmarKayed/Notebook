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
import { ref, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage'

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

async function launchCamera() {
  try {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (result.granted === false) {
      alert("Du skal give adgang til kameraet for at kunne tage billeder");
      return;
    }

    const response = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!response.canceled) {
      setImagePath(response.assets[0].uri);
    }
  } catch (error) {
    console.error("Fejl ved kameraet:", error);
    alert("Der opstod en fejl ved kameraet");
  }
}

async function savePicture() {
  try {
    const res = await fetch(imagePath);
    const blob = await res.blob();
    
    const storageRef = ref(storage, "IMG_6031.png");
    const uploadTaskSnapshot = await uploadBytes(storageRef, blob);
    const imageUrl = await getDownloadURL(uploadTaskSnapshot.ref);
    
    // Gem tekst og billedets URL i Firestore
    await addDoc(collection(database, "notes"), {
      text: fullText,
      imageUrl: imageUrl,
    });
    
    console.log("Data blev gemt i Firebase");
  } catch (error) {
    console.error("Fejl ved gemning af data:", error);
  }
}

async function deletePicture() {
  try {
    const storageRef = ref(storage, "IMG_6031.png");
    await deleteObject(storageRef);

    setImagePath(null);
    
    console.log("Billedet blev slettet fra Firebase");
  } catch (error) {
    console.error("Fejl ved sletning af billedet fra Firebase", error);
  }
}

  

  return (
    <View style={styles.container}>
      <Text>{fullText}</Text>
      <Image source={{ uri: imagePath }} style={{ width: 300, height: 300 }} />
      <Button title="get Picture" onPress={getPicture} />
      <Button title="Upload Picture" onPress={uploadPicture} />
      <Button title="Download Picture" onPress={downloadPicture} />
      <Button title="Launch Camera" onPress={launchCamera} />
      <Button title="Save Picture" onPress={savePicture} />
      <Button title="Delete Picture" onPress={deletePicture} />
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
