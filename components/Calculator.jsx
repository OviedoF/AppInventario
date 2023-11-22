import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
} from "react-native";

const Calculator = ({
  setModalCalculatorVisible,
  modalCalculatorVisible,
  setQuantity,
}) => {
  const [displayText, setDisplayText] = useState("");

  const handleButtonPress = (text) => {
    if (text === "=") {
      calculateResult();
    } else if (text === "C") {
      clearDisplay();
    } else {
      setDisplayText((prevDisplayText) => prevDisplayText + text);
    }
  };

  const clearDisplay = () => {
    setDisplayText("");
  };

  const calculateResult = () => {
    try {
      const result = eval(displayText);
      setDisplayText(result.toString());
      setQuantity(result.toString());
      setModalCalculatorVisible(!modalCalculatorVisible);
    } catch (error) {
      setDisplayText("Error");
    }
  };

  const buttons = [
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["C", "0", "=", "+"],
  ];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalCalculatorVisible}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={[styles.container, {
        width: '100%',
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
      }]}>
        <View style={styles.closeBtn}>
          <Button
            onPress={() => setModalCalculatorVisible(!modalCalculatorVisible)}
            title="X"
          ></Button>
        </View>
        <View style={styles.display}>
          <Text style={styles.displayText}>{displayText}</Text>
        </View>
        <View style={styles.buttons}>
          {buttons.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.buttonRow}>
              {row.map((buttonText, buttonIndex) => (
                <TouchableOpacity
                  key={buttonIndex}
                  style={styles.button}
                  onPress={() => handleButtonPress(buttonText)}
                >
                  <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeBtn: {
    alignItems: "flex-end",
    margin: 2,
  },
  container: {
    flex: 1,
    marginTop: 80,
    marginBottom: 50,
    marginHorizontal: 50,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  display: {
    flex: 2,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "flex-end",
    padding: 10,
  },
  displayText: {
    fontSize: 32,
    color: "white",
  },
  buttons: {
    flex: 3,
    backgroundColor: "#555",
  },
  buttonRow: {
    flex: 1,
    flexDirection: "row",
  },
  button: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#999",
  },
  buttonText: {
    fontSize: 32,
    color: "white",
    lineHeight: 40,
  },
});

export default Calculator;
