import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// import screens
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import MessagesScreen from '../screens/MessagesScreen';
import AddPostScreen from '../screens/AddPostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const FeedStack = ({navigation}) => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{
        headerTitleAlign: 'center',
        headerTitleStyle: {
          color: '#2e64e5',
          fontFamily: 'Kufam-SemiBoldItalic',
          fontSize: 18,
        },
        headerStyle: {
          shadowColor: '#fff',
          elevation: 0,
        },
        headerRight: () => (
          <View style={{marginRight: 10}}>
            <Icon
              name="add-circle"
              size={35}
              backgroundColor="#fff"
              color="#2e64e5"
              onPress={() => navigation.navigate('AddPostScreen')}
            />
          </View>
        ),
      }}
    />

    <Stack.Screen
      name="AddPostScreen"
      component={AddPostScreen}
      options={{
        title: '',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#2e64e515',
          shadowColor: '#2e64e515',
          elevation: 0,
        },
        headerBackTitleVisible: false,
        headerBackImage: () => (
          <TouchableOpacity style={styles.gobackButton}>
            <Icon name="arrow-back" size={30} color="#2e64e5" />
          </TouchableOpacity>
        ),
        // headerRight: ()=>(
        //   <Text style={{marginRight: 10, color: "#2e64e5", fontSize: 18, fontWeight: 'bold'}}>Post</Text>
        // )
      }}
    />

    <Stack.Screen
      name="ProfileScreen"
      component={ProfileScreen}
      options={{
        title: 'Profile',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#fff',
          elevation: 0,
        },
        headerBackTitleVisible: false,
        headerBackImage: () => (
          <TouchableOpacity style={styles.gobackButton}>
            <Icon name="arrow-back" size={30} color="#2e64e5" />
          </TouchableOpacity>
        ),
      }}
    />
  </Stack.Navigator>
);

const MessageStack = ({navigation}) => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}>
    <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
    <Stack.Screen
      name="ChatScreen"
      component={ChatScreen}
      options={({route}) => ({
        title: route.params.userName,
        headerBackTitleVisible: false,
      })}
    />
  </Stack.Navigator>
);

const ProfileStack = ({navigation}) => (
  <Stack.Navigator>
    <Stack.Screen
      name="ProfileScreen"
      component={ProfileScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="EditProfileScreen"
      component={EditProfileScreen}
      options={{
        headerTitle: 'Edit Profile',
        headerBackTitleVisible: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#fff',
          elevation: 0,
        },
      }}
    />
  </Stack.Navigator>
);

const AppStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        activeTintColor: '#2e64e5',
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={FeedStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessageStack}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({color, size}) => (
            <Icon name="chatbox-ellipses-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppStack;

const styles = StyleSheet.create({
  gobackButton: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
});
