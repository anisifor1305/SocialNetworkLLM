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
import Forums from './Components/Forums';
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
          <Route path="/:handle" element={<ProtectedRoute><NotYourProfile part="posts"/></ProtectedRoute>} />
          <Route path="/:handle/friends" element={<ProtectedRoute><NotYourProfile part="friends"/></ProtectedRoute>} />
          <Route path="/:handle/photos" element={<ProtectedRoute><NotYourProfile part="photos"/></ProtectedRoute>} />
           <Route path="/forums" element={<ProtectedRoute><Forums /></ProtectedRoute>} />
        </Routes>
        </AuthProvider>
        </BrowserRouter>
    </div>
  );
}

export default App;