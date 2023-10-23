import React, { useState, useEffect, useRef } from "react";
import { View, TextInput } from "react-native";
import { useForm, Controller } from "react-hook-form";

export default function Form({ children, onSubmit, style }) {
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  return (
    <View style={style}>
      {React.Children.map(children, (child, index) => {
        if (index === 0 && child.type === Controller) {
          return React.cloneElement(child, {
            ref: (inputRef) => {
              // Set ref for the first input
              firstInputRef.current = inputRef;
              // Also call the original ref if it exists
              if (child.props.ref) {
                child.props.ref(inputRef);
              }
            },
          });
        }
        return child;
      })}
    </View>
  );
}