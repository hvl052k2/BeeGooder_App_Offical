import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FormButton from "../components/FormButton";
import FormInput from "../components/FormInput";
import SocialButton from "../components/SocialButton";
import { useContext, useState } from "react";
import { AuthContext } from "../navigation/AuthProvider.android";

export default LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const {register} = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Icon name="logo-octocat" size={120} color="purple" />
      <Text style={styles.title}>SIGN UP</Text>

      <FormInput
        lableValue={email}
        onChangeText={(userEmail) => {
          setEmail(userEmail);
        }}
        placeHolderText="Email"
        iconType="person-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FormInput
        lableValue={password}
        onChangeText={(userPassword) => {
          setPassword(userPassword);
        }}
        placeHolderText="Password"
        iconType="lock-closed-outline"
        secureTextEntry={visible}
      >
        <View style={styles.iconStyle}>
          <Icon
            name={visible ? "eye-outline" : "eye-off-outline"}
            size={25}
            color="#666"
            onPress={() => {
              setVisible(!visible);
            }}
          />
        </View>
      </FormInput>

      <FormInput
        lableValue={confirmPassword}
        onChangeText={(userConfirmPassword) => {
          setConfirmPassword(userConfirmPassword);
        }}
        placeHolderText="Confirm Password"
        iconType="lock-closed-outline"
        secureTextEntry={visible}
      >
        <View style={styles.iconStyle}>
          <Icon
            name={visible ? "eye-outline" : "eye-off-outline"}
            size={25}
            color="#666"
            onPress={() => {
              setVisible(!visible);
            }}
          />
        </View>
      </FormInput>

      <FormButton
        buttonTitle="Sign Up"
        onPress={() => register(email, password)}
      />

      <View style={styles.textPrivate}>
        <Text style={styles.color_textPrivate}>
          By registering, you confirm that you accept our{" "}
        </Text>
        <TouchableOpacity onPress={() => alert("Terms clicked")}>
          <Text style={[styles.color_textPrivate, { color: "#e88832" }]}>
            Terms of service
          </Text>
        </TouchableOpacity>
        <Text style={styles.color_textPrivate}> and </Text>
        <TouchableOpacity onPress={() => alert("Privacy clicked")}>
          <Text style={[styles.color_textPrivate, { color: "#e88832" }]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      <SocialButton
        buttonTitle="Sign in with facebook"
        btnType="logo-facebook"
        color="#4867aa"
        backgroundColor="#e6eaf4"
        onPress={() => {}}
      />

      <SocialButton
        buttonTitle="Sign in with google"
        btnType="logo-google"
        color="#de4d41"
        backgroundColor="#f5e7ea"
        onPress={() => {}}
      />

      <View style={styles.navButton}>
        <Text style={styles.text}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.navButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 40,
    marginBottom: 10,
    color: "purple",
    fontWeight: "600",
  },
  iconStyle: {
    padding: 10,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    width: 50,
  },
  navButton: {
    marginTop: 30,
    flexDirection: "row",
  },
  textPrivate: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 30,
    justifyContent: "center",
  },
  text: {
    fontSize: 17,
    fontWeight: "500",
    color: "#2e64e5",
  },
  navButtonText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#2e64e5",
    textDecorationLine: "underline",
  },
  color_textPrivate: {
    fontSize: 13,
    fontWeight: "400",
    color: "gray",
  },
});
