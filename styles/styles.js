import { StyleSheet } from "react-native";
import Constants from "expo-constants";

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
    fontSize: 20,
  },
  subtitle: {
    fontWeight: "500",
    fontSize: 16,
  },
  container: {
    alignItems: "center",
    marginTop: 30,
  },
  input: {
    width: "80%",
    height: 48,
    borderBottomWidth: 1,
    marginBottom: 10,
    color: "blue",
  },
  img: {
    width: 200,
    height: 200,
    marginTop: 50,
  },
  logoIcon: {
    width: 100,
    height: 100,
    marginTop: 50,
  },
  pySm: {
    paddingVertical: 5,
  },
  mbSm: {
    marginBottom: 15,
  },
  mtSm: {
    marginTop: 15,
  },
  mxSm: {
    marginHorizontal: 15,
  },
  mySm: {
    marginVertical: 15,
  },
  myXs: {
    marginVertical: 5,
  },
  mxAuto: {
    marginHorizontal: "auto",
  },
  link: {
    color: "blue",
  },
  primaryBtn: {
    marginTop: 15,
    width: "90%",
    /* backgroundColor: "linear-gradient(98.34deg, #4960F9 -14.39%, #4033FF 113.22%)", */
    backgroundColor: "#4960F9",
    borderRadius: 18,
    padding: 15,
  },
  logBtn: {
    marginTop: 15,
    width: "45%",
    backgroundColor: "#4960F9",
    borderRadius: 18,
    padding: 15,
    margin: 10,
  },
  red: {
    color: "red",
  },
  white: {
    color: "white",
  },
  textCenter: {
    textAlign: "center",
  },
  btnText: {
    color: "blue",
  },
  BgBlue: {
    backgroundColor: "#272459",
  },
  btnShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 4.0,
    elevation: 4,
  },
  //? estilos para id superior
  backBtnContainer: {
    display: "flex",
    paddingTop: Constants.statusBarHeight,
    zIndex: 1111,
    width: "100%",
    backgroundColor: "white",
  },
  backBtn: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  SearchField: {
    width: 250,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
  },
  /* dropdown: {
      position: "absolute",
      backgroundColor: "#fff",
      width: "80%",
      height: 250,
      shadowColor: "#000000",
      shadowRadius: 4,
      shadowOffset: { height: 4, width: 0 },
      shadowOpacity: 0.5,
      borderRadius: 10,
      padding: 10,
    },
    overlay: {
      width: "100%",
      height: "100%",
      alignItems: "center",
    },
    dropdownItem: {
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: "#707070",
    }, */
});

export default styles;
