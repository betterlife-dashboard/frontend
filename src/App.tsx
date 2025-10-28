import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import RepeatTodos from '@/pages/RepeatTodos';

const App = () => (
  <Routes>
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<Home />} />
      <Route path="/repeat-todos" element={<RepeatTodos />} />
    </Route>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
