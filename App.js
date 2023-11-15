import { StatusBar } from "expo-status-bar";
import { NativeRouter } from "react-router-native";
import AppRouter from "./router/AppRouter";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DataProvider } from "./context/dataContext";
import SnackbarComponent from "./components/SnackbarComponent";
import { Dimensions, View } from "react-native";

export default function App() {
  return (
    <DataProvider>
      <NativeRouter>
        <SafeAreaProvider>
          <View style={{ minHeight: Dimensions.get("window").height }}>
            <StatusBar />
            <AppRouter />
            <SnackbarComponent />
          </View>
        </SafeAreaProvider>
      </NativeRouter>
    </DataProvider>
  );
}
