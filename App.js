import { StatusBar } from "expo-status-bar";
import { NativeRouter } from "react-router-native";
import AppRouter from "./router/AppRouter";
import { DataProvider } from "./context/DataContext";

export default function App() {
  return (
    <DataProvider>
      <NativeRouter>
        <StatusBar />
        <AppRouter />
      </NativeRouter>
    </DataProvider>
  );
}
