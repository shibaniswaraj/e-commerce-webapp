
import './App.css'
import Footer from './components/footer';
import Header from './components/header'
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  

  return (
    <Router>
      <Header/>
      <Footer/>
    </Router>
  )
}

export default App
