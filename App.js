import { StatusBar } from "expo-status-bar";
import { NativeRouter } from "react-router-native";
import AppRouter from "./router/AppRouter";

export default function App() {
  return (
    <NativeRouter>
      <StatusBar />
      <AppRouter />
    </NativeRouter>
  );
}
