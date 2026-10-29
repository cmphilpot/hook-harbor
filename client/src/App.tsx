import { Route, Routes } from 'react-router'
import BucketPage from './components/BucketPage'
import Header from './components/Header'
import HomePage from './components/HomePage'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/buckets/:id" element={<BucketPage />} />
      </Routes>
    </>
  )
}

export default App
