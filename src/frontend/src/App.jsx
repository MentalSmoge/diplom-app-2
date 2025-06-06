import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Board from "./pages/board";
import Projects from "./pages/projects";
import Users from "./pages/users";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import ProtectedRoute from "./components/protectedRoute";
import { Header } from "./components/header";
import Boards from "./pages/boards";
import Invitations from "./pages/invitations";

function App() {
  return (
    <Router >
      <div className="App" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
        <Header />
        <main style={{ flex: 1, overflow: 'hidden' }} >
          <Routes>
            <Route path="/" element={<Navigate to="/projects" />} />
            <Route path="/user" element={<Users />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/projects" element={<Projects />} />
              <Route path="/project/:projectId" element={<Boards />} />
              <Route path="/boards" element={<Boards />} />
              <Route path="/boards/:boardId" element={<Board />} />
              <Route path="/invitations" element={<Invitations />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App;