import React, { useState, useEffect } from "react";
import { View, Button, Text, FlatList } from "react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import axios from "axios";

export default function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [events, setEvents] = useState([]);

  const configGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId:
        "1086673457628-qpef55k08d8b0g237i916odm5bg7e66e.apps.googleusercontent.com",
      scopes: ["https://www.googleapis.com/auth/calendar"],
      iosClientId:
        "1086673457628-45e341jj19p2pfe48quge3ctpvj68ka2.apps.googleusercontent.com",
    });
  };
  useEffect(() => {
    configGoogleSignIn();
  }, []);

  useEffect(() => {
    GoogleSignin.signInSilently()
      .then((userInfo) => {
        setUserInfo(userInfo);
        GoogleSignin.getTokens().then(({ accessToken }) => {
          console.log(accessToken);
          fetchEvents(accessToken);
        });
      })
      .catch((error) => {
        if (error.code !== statusCodes.SIGN_IN_REQUIRED) {
          console.error(error);
        }
      });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);
      setUserInfo(userInfo);
      const { accessToken } = await GoogleSignin.getTokens();
      fetchEvents(accessToken);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
        console.error(error);
      }
    }
  };
  const fetchEvents = async (idToken) => {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      console.log(response.data.items[0]);
      setEvents(response.data.items);
    } catch (error) {
      console.error(error);
    }
  };

  const logout = () => {
    GoogleSignin.revokeAccess();
    setUserInfo(null);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {userInfo ? (
        <>
          <Text style={{ fontSize: 20, fontWeight: "700" }}>
            {userInfo.name}
          </Text>
          <Text onPress={logout}>logout</Text>
        </>
      ) : (
        <Button title="Sign In with Google" onPress={signIn} />
      )}
      {events.length > 0 && (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Text>
              {index}. {item.summary}
            </Text>
          )}
        />
      )}
    </View>
  );
}
