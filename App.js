import { StatusBar } from "expo-status-bar";
import { NativeRouter } from "react-router-native";
import AppRouter from "./router/AppRouter";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DataProvider } from "./context/dataContext";
import SnackbarComponent from "./components/SnackbarComponent";
import { Dimensions, View } from "react-native";
import DangerModal from "./components/DangerModal";

export default function App() {
  return (
    <DataProvider>
      <NativeRouter>
        <SafeAreaProvider>
          <View style={{ minHeight: Dimensions.get("window").height }}>
            <StatusBar />
            <AppRouter />
            <SnackbarComponent />
            <DangerModal />
          </View>
        </SafeAreaProvider>
      </NativeRouter>
    </DataProvider>
  );
}