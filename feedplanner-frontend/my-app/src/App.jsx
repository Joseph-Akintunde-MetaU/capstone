import { BrowserRouter, Routes, Route} from 'react-router-dom'
import './App.css'
import { UserAuthPage } from './UserAuthPage'
function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path='/' element = {<UserAuthPage/>}>
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App
