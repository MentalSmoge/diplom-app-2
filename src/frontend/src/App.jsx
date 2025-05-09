import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Board from "./pages/board";
import Users from "./pages/users";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import ProtectedRoute from "./components/protectedRoute";
import { Header } from "./components/header";
import Boards from "./pages/boards";

function App() {
  return (
    <Router >
      <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/board" />} />
            <Route path="/user" element={<Users />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/boards" element={<Boards />} />
              <Route path="/boards/:boardId" element={<Board />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App;