import { Route, Routes } from "react-router-native";
import routes from "./routes";
import Login from "../pages/Login";
import CaptureMenu from "../pages/CaptureMenu";
import ProductEntry from "../pages/ProductEntry";
import CDProductEntry from "../pages/CD/CDProductEntry";
import CDReview from "../pages/CD/CDReview";
import CD from "../pages/CD/CD";
import SendWIFI from "../pages/SendWIFI";
import Review from "../pages/Review";
import AdminMenu from "../pages/AdminMenu";
import AreaView from "../pages/AreaView";
import CDView from "../pages/CD/CDView";
import CDWifiSend from "../pages/CD/CDWifiSend";

const AppRouter = () => {
  return (
    <Routes>
      {/* ---------------- LOGIN ---------------- */}
      <Route exact path={routes.login} element={<Login />} />
      {/* ---------------- USER ---------------- */}
      <Route exact path={routes.menuAdmin} element={<AdminMenu />} />
      <Route exact path={routes.captureMenu} element={<CaptureMenu />} />
      <Route exact path={routes.review} element={<Review />} />
      <Route exact path={routes.view} element={<AreaView />} />
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
      <Route exact path={routes.sentWifi} element={<SendWIFI />} />
      {/* ---------------- CD ---------------- */}

      <Route exact path={routes.cD} element={<CD />} />
      <Route exact path={routes.cDFastSend} element={<CD fastSend={true}/>}  />
      <Route exact path={routes.cDClear} element={<CD clear={true}/>}  />
      <Route exact path={routes.cDEdit} element={<CD fastEdit={true}/>}  />
      
      <Route exact path={routes.cDWifiSend} element={<CDWifiSend />}  />

      <Route exact path={routes.cdView} element={<CDView />} />

      <Route
        exact
        path={routes.cdSingleProductEntry}
        element={<CDProductEntry type="single" />}
      />
      <Route
        exact
        path={routes.cdMultipleProductEntry}
        element={<CDProductEntry type="multi" />}
      />
      <Route exact path={routes.cdReview} element={<CDReview />} />
    </Routes>
  );
};

export default AppRouter;
