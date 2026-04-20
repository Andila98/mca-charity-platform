import { FiHeart, FiTarget, FiEye, FiAward } from 'react-icons/fi'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About MCA Charity</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We are a community-driven organization dedicated to uplifting lives and creating sustainable change across Kenya's diverse communities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: FiTarget, title: 'Our Mission', color: 'text-blue-600 bg-blue-50', text: 'To empower communities through targeted interventions in health, education, and economic development.' },
          { icon: FiEye, title: 'Our Vision', color: 'text-green-600 bg-green-50', text: 'A Kenya where every community has the resources and support to thrive independently.' },
          { icon: FiAward, title: 'Our Values', color: 'text-purple-600 bg-purple-50', text: 'Integrity, compassion, transparency, and community-first approaches in everything we do.' },
        ].map(({ icon: Icon, title, color, text }) => (
          <div key={title} className="card text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${color}`}>
              <Icon size={22} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600">{text}</p>
          </div>
        ))}
      </div>

      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
        <p className="text-gray-600 mb-4">
          Founded with a passion for community development, MCA Charity has been at the forefront of social transformation in Kenya. We work hand-in-hand with local leaders, volunteers, and donors to deliver impactful programs.
        </p>
        <p className="text-gray-600">
          From healthcare outreach to youth empowerment programs, our diverse portfolio of projects addresses the most pressing needs of underserved communities across Kenya's 47 counties.
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-8 text-center">
        <FiHeart className="mx-auto mb-4 text-red-400" size={40} />
        <h2 className="text-2xl font-bold mb-3">Join Our Movement</h2>
        <p className="text-blue-200 mb-6">Be part of the change. Together, we can achieve more.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/donate" className="btn-primary px-6 bg-red-600 hover:bg-red-700">Donate</a>
          <a href="/volunteers" className="btn px-6 border border-white text-white hover:bg-white hover:text-blue-900">Volunteer</a>
        </div>
      </div>
    </div>
  )
}
