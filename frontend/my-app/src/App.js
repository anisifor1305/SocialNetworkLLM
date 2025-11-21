import logo from './logo.svg';
// import './App.css';
// import ShopView from './Components/Shop';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Auth from './Components/Auth';
import Main from './Components/Main';
import Registration from './Components/Registration';
import ProtectedRoute from './Components/ProtectedRoute'
import { AuthProvider } from './Contexts/AuthContext';
import NotYourProfile from './Components/NotYourProfile'
import NewPost from './Components/NewPost';
function App() {
  return (
    <div className="App">

        <BrowserRouter>
        <AuthProvider>
        <Routes>
          {/* <Route path="/" element={<Main/>}></Route> */}
          <Route path="/auth" element={<Auth/>}></Route>
          <Route path="/registration" element={<Registration/>}></Route>
          <Route path="/" element={<ProtectedRoute><Main /></ProtectedRoute>} />
          <Route path="/handler" element={<ProtectedRoute><NotYourProfile /></ProtectedRoute>} />
          <Route path="/newpost" element={<ProtectedRoute><NewPost /></ProtectedRoute>} />
        </Routes>
        </AuthProvider>
        </BrowserRouter>
    </div>
  );
}

export default App;