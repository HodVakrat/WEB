import './App.css'
import logo from './assets/logo.png'
import Footer from './UIComponents/Footer'
import ComponentSwitcher from './UIComponents/ComponentSwitcher'

function App() {
  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Contact', path: '/contact' },
    { label: 'Login', path: '/login' },
  ]
    
  return (
    <div className="w-full h-full absolute bg-gray-900">
      <header className="flex items-center py-6 px-8 md:px-32 bg-gray-800 text-white drop-shadow-md border-b border-gray-700">
        <a href="#"><img src={logo} alt="Logo" className="w-20 hover:scale-120 transition-all" /></a>
        <ul className="hidden md:flex items-center gap-12 font-semibold text-base">
          {menuItems.map((item) => (
            <li key={item.path} className="p-3 hover:bg-blue-600 hover:text-white rounded-md transition-all cursor-pointer text-gray-200">
              {item.label}
            </li>
          ))}
        </ul>
      </header>
      <ComponentSwitcher />
      <Footer />
    </div>
  )
}

export default App