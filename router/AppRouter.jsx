import { Route, Routes } from "react-router-native";
import routes from "./routes";
import Login from "../pages/Login";

const AppRouter = () => {
  return (
    <Routes>
      {/* ---------------- LOGIN ---------------- */}
      <Route exact path={routes.login} element={<Login />} />
      {/* ---------------- USER ---------------- */}
      {/* <Route exact path={routes.home} element={<Home />} /> */}
    </Routes>
  );
};

export default AppRouter;
