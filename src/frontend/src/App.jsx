import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { Board } from "./pages/board";
import Users from "./pages/users";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import ProtectedRoute from "./components/protectedRoute";

function App() {

  return (
    <>
      <Router>
        <div className="App">
          <nav>
            <ul>
              <li>
                <Link to="/board">Board</Link>
              </li>
              <li>
                <Link to="/user">Users</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </ul>
          </nav>

          <Routes>
            <Route path="/" element={<Navigate to="/board" />} />
            <Route path="/user" element={<Users />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/board/:boardId" element={<Board />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
