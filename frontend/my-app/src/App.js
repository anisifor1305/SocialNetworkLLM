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
import MyProfile from './Components/MyProfile'
import Communities from './Components/Communities';
import CreateForum from './Components/CreateForum';
import Notifications from './Components/Notifications'
import Messanger from './Components/Messanger'
import EditProfile from './Components/EditProfile';

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

          <Route path="/:handle" element={<ProtectedRoute><NotYourProfile part="posts"/></ProtectedRoute>} />
          <Route path="/:handle/friends" element={<ProtectedRoute><NotYourProfile part="friends"/></ProtectedRoute>} />
          <Route path="/:handle/photos" element={<ProtectedRoute><NotYourProfile part="photos"/></ProtectedRoute>} />

          <Route path="/handler" element={<ProtectedRoute><NotYourProfile /></ProtectedRoute>} />
          <Route path="/newpost" element={<ProtectedRoute><NewPost /></ProtectedRoute>} />

          <Route path="/myprofile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
          <Route path="/createforum" element={<ProtectedRoute><CreateForum /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

          <Route path="/messanger" element={<ProtectedRoute><Messanger /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/messanger" element={<ProtectedRoute><Messanger /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

        </Routes>
        </AuthProvider>
        </BrowserRouter>
    </div>
  );
}

export default App;