import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

const CustomPicker = ({ options, selectedValue, onValueChange, placeHolder }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = (value) => {
    setModalVisible(false);
    onValueChange(value);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.pickerButtonText}>{placeHolder}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => handlePress(item.value)}>
                <Text>{item.label}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    borderRadius: 5,
    padding: 10,
    alignItems: 'flex-start',
    backgroundColor: '#00000020',
  },
  pickerButtonText: {
    fontSize: 16,
    textAlign: 'left',
  },
  modalContainer: {
    backgroundColor: '#fefefe',
    padding: 20,
    marginTop: 'auto',
    height: '50%',
  },
  optionItem: {
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    backgroundColor: '#00000010',
    elevation: 1,
    marginBottom: 10,
  },
  cancelButton: {
    marginTop: 0,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    alignItems: 'center',

  },
  cancelButtonText: {
    color: 'white',
  },
});

export default CustomPicker;