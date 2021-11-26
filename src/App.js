import { Navigate, Route, Routes } from "react-router";
import Streamer from "./page/Streamer";
import Viewer from "./page/Viewer";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Streamer />} />
      <Route path="viewer" element={<Viewer />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
