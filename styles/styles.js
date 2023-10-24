import { StyleSheet, Dimensions } from "react-native";
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
    backgroundColor: "#005DA6",
    borderRadius: 18,
    padding: 15,
  },
  logBtn: {
    marginTop: 15,
    width: "80%",
    backgroundColor: "#005DA6",
    borderRadius: 18,
    padding: 15,
    margin: 10,
  },
  cdBtn: {
    marginTop: 15,
    width: "45%",
    backgroundColor: "#FAA153",
    borderRadius: 18,
    padding: 15,
    margin: 10,
    alignItems: "center",
  },
  cdField: {
    width: "45%",
    height: 48,
    borderBottomWidth: 1,
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
  backBtn: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
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
  topSectionContainer: {
    display: "flex",
    marginTop: Constants.statusBarHeight,
    zIndex: 1111,
    width: "100%",
    backgroundColor: "#075E55",
  },
  SearchField: {
    width: 250,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,.5)",
    position: "absolute",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height + 100,
    top: Constants.statusBarHeight,
    left: 0
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  flex_row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "left",
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