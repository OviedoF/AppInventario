import { StatusBar } from "expo-status-bar";
import { NativeRouter } from "react-router-native";
import AppRouter from "./router/AppRouter";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from "./context/dataContext";

export default function App() {
  return (
    <DataProvider>
      <NativeRouter>
      <SafeAreaProvider>
        <StatusBar />
        <AppRouter />
      </SafeAreaProvider>
      </NativeRouter>
    </DataProvider>
  );
}
