import { Route, Routes } from "react-router-native";
import routes from "./routes";
import Login from "../pages/Login";
import Home from "../pages/Home";
import CaptureMenu from "../pages/CaptureMenu";
import ProductEntry from "../pages/ProductEntry";
import CD from "../pages/CD";

const AppRouter = () => {
  return (
    <Routes>
      {/* ---------------- LOGIN ---------------- */}
      <Route exact path={routes.login} element={<Login />} />
      {/* ---------------- USER ---------------- */}
      <Route exact path={routes.home} element={<Home />} />
      <Route exact path={routes.captureMenu} element={<CaptureMenu />} />
      <Route exact path={routes.cD} element={<CD />} />
      <Route
        exact
        path={routes.singleProductEntry}
        element={<ProductEntry type="single" />}
      />
      <Route
        exact
        path={routes.multipleProductEntry}
        element={<ProductEntry type="multi" />}
      />
    </Routes>
  );
};

export default AppRouter;
