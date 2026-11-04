import { Route, Routes } from 'react-router'
import BucketPage from './components/BucketPage'
import Header from './components/Header'
import HomePage from './components/HomePage'
import RequestsPage from './components/RequestsPage'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/piers/:id" element={<BucketPage />} />
        <Route path="/requests" element={<RequestsPage />} />
      </Routes>
    </>
  )
}

export default App
