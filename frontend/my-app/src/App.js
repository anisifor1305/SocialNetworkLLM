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
<<<<<<< HEAD
import NewPost from './Components/NewPost';
=======
import MyProfile from './Components/MyProfile'
import Forums from './Components/Forums';
import CreateForum from './Components/CreateForum';
>>>>>>> 00d07f1979f36db3cc94d4c9cc1fe4dd0333a899
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
<<<<<<< HEAD
          <Route path="/handler" element={<ProtectedRoute><NotYourProfile /></ProtectedRoute>} />
          <Route path="/newpost" element={<ProtectedRoute><NewPost /></ProtectedRoute>} />
=======
          <Route path="/:handle" element={<ProtectedRoute><NotYourProfile /></ProtectedRoute>} />
          <Route path="/myprofile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="/forums" element={<ProtectedRoute><Forums /></ProtectedRoute>} />
          <Route path="/createforum" element={<ProtectedRoute><CreateForum /></ProtectedRoute>} />
>>>>>>> 00d07f1979f36db3cc94d4c9cc1fe4dd0333a899
        </Routes>
        </AuthProvider>
        </BrowserRouter>
    </div>
  );
}

export default App;