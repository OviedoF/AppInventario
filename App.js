import { StatusBar } from "expo-status-bar";
import { NativeRouter } from "react-router-native";
import AppRouter from "./router/AppRouter";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from "./context/dataContext";
import SnackbarComponent from "./components/SnackbarComponent";

export default function App() {
  return (
    <DataProvider>
      <NativeRouter>
        <SafeAreaProvider>
          <StatusBar />
          <AppRouter />
          <SnackbarComponent />
        </SafeAreaProvider>
      </NativeRouter>
    </DataProvider>
  );
}
