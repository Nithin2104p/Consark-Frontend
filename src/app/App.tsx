import { AuthProvider } from "./auth/AuthContext";
import { AppRouter } from "./routes/AppRouter";
import "./app.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </AuthProvider>
  );
}
