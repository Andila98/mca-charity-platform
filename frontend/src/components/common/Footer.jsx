import { Link } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-white text-lg mb-3">
              <FiHeart className="text-red-400" /> MCA Charity
            </div>
            <p className="text-sm text-gray-400">Empowering communities through compassionate action and sustainable change.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Home'], ['/projects', 'Projects'], ['/events', 'Events'], ['/about', 'About Us']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Get Involved</h4>
            <ul className="space-y-2 text-sm">
              {[['/donate', 'Donate'], ['/volunteers', 'Volunteer'], ['/register', 'Register']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <p className="text-sm">info@mcacharity.org</p>
            <p className="text-sm mt-1">+254 700 000 000</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} MCA Charity Platform. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
