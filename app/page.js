'use client'

import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>LiteAuth - Simple & Secure Authentication</title>
        <meta name="description" content="Streamlined authentication solutions for modern applications" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Main Hero Section */}
        <main className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            
            {/* Logo Section */}
            <div className="mb-12 animate-fade-in-down">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  {/* Animated background circle */}
                  <div className="absolute inset-0 bg-blue-200 rounded-full animate-pulse opacity-30"></div>
                  
                  {/* Main logo container */}
                  <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-full shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-3">
                    {/* Lock and Shield Combined Icon */}
                    <svg 
                      className="w-16 h-16 text-white animate-bounce-slow" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                      />
                    </svg>
                    
                    {/* Floating particles effect */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                    <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-green-400 rounded-full animate-pulse delay-300"></div>
                    <div className="absolute top-0 left-0 w-1 h-1 bg-white rounded-full animate-bounce delay-500"></div>
                  </div>
                </div>
              </div>
              
              {/* Animated Brand Name */}
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-wider animate-slide-in-left">
                  Lite
                </h2>
                <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-slide-in-right">
                  Auth
                </span>
              </div>
 
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-fade-in-up delay-500">
              Simple & Secure
              <span className="block text-blue-600 animate-slide-in-bottom delay-700">Authentication</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto animate-fade-in-up delay-1000">
              LiteAuth provides streamlined authentication solutions for modern applications.
              Get up and running in minutes with our lightweight, secure, and developer-friendly platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in-up delay-1200">
              <Link href="/register" className="group bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-lg text-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl">
                <span className="flex items-center">
                  Get Started
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              
              <Link href="/login" className="group bg-white hover:bg-gray-50 text-gray-800 px-10 py-5 rounded-lg text-xl font-semibold border border-gray-300 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-md hover:shadow-lg">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </span>
              </Link>
            </div>

            {/* Floating background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-float"></div>
              <div className="absolute top-40 right-20 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-float delay-1000"></div>
              <div className="absolute bottom-32 left-20 w-12 h-12 bg-purple-200 rounded-full opacity-20 animate-float delay-2000"></div>
              <div className="absolute bottom-20 right-10 w-8 h-8 bg-blue-300 rounded-full opacity-30 animate-float delay-3000"></div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-bottom {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce-slow {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }

        .animate-fade-in-down { animation: fade-in-down 1s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.8s ease-out; }
        .animate-slide-in-bottom { animation: slide-in-bottom 1s ease-out; }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-1000 { animation-delay: 1s; }
        .delay-1200 { animation-delay: 1.2s; }
        .delay-2000 { animation-delay: 2s; }
        .delay-3000 { animation-delay: 3s; }
      `}</style>
    </>
  )
}
