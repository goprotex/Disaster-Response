'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import RequestForm from '@/components/RequestForm'
import AuthModal from '@/components/AuthModal'

// Dynamic import to avoid SSR issues with Leaflet
const DisasterMap = dynamic(() => import('@/components/DisasterMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
})

export default function Home() {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [requests, setRequests] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<string>('')

  useEffect(() => {
    // Check for URL params (auth success/error)
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')
    
    if (success === 'auth_success') {
      setNotification('Successfully signed in!')
      window.history.replaceState({}, '', '/')
    } else if (error) {
      setNotification('Authentication failed. Please try again.')
      window.history.replaceState({}, '', '/')
    }

    // Clear notification after 5 seconds
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
        
        if (event === 'SIGNED_IN') {
          setShowAuthModal(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleNewRequest = (request: any) => {
    setRequests(prev => [...prev, request])
  }

  const handleReportNeed = () => {
    if (user) {
      setShowRequestForm(true)
    } else {
      setShowAuthModal(true)
    }
  }

  const handleOfferHelp = () => {
    if (user) {
      // TODO: Implement offer help form
      alert('Offer help feature coming soon!')
    } else {
      setShowAuthModal(true)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-disaster-blue">
                🌪️ Disaster Coordination
              </h1>
            </div>
            <nav className="flex space-x-4">
              {loading ? (
                <div className="w-20 h-10 bg-gray-200 animate-pulse rounded"></div>
              ) : user ? (
                <>
                  <button 
                    onClick={handleReportNeed}
                    className="disaster-button-primary"
                  >
                    Report Need
                  </button>
                  <button 
                    onClick={handleOfferHelp}
                    className="disaster-button-secondary"
                  >
                    Offer Help
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-800 px-3 py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="disaster-button-primary"
                >
                  Sign In to Help
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="disaster-card">
              <h2 className="text-xl font-semibold mb-4">Live Disaster Map</h2>
              <Suspense fallback={<div className="h-96 bg-gray-200 animate-pulse rounded-lg" />}>
                <DisasterMap requests={requests} offers={offers} />
              </Suspense>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Status */}
            {user && (
              <div className="disaster-card">
                <h3 className="text-lg font-semibold mb-3">Welcome Back!</h3>
                <div className="text-sm text-gray-600">
                  <p>Signed in as: <span className="font-medium">{user.email}</span></p>
                  <p className="mt-1">Ready to help coordinate disaster response.</p>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="disaster-card">
              <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Active Requests:</span>
                  <span className="font-semibold text-disaster-red">{requests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Offers Available:</span>
                  <span className="font-semibold text-disaster-green">{offers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resources Matched:</span>
                  <span className="font-semibold text-disaster-blue">0</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="disaster-card">
              <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
              <div className="text-gray-600 text-sm">
                {requests.length === 0 
                  ? "No recent activity. Be the first to report a need or offer help!"
                  : `${requests.length} request(s) submitted recently.`
                }
              </div>
            </div>

            {/* How it Works */}
            <div className="disaster-card">
              <h3 className="text-lg font-semibold mb-3">How it Works</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="text-disaster-red mr-2">1.</span>
                  <span>Report what you need with photos and location</span>
                </div>
                <div className="flex items-start">
                  <span className="text-disaster-orange mr-2">2.</span>
                  <span>Volunteers see your request on the map</span>
                </div>
                <div className="flex items-start">
                  <span className="text-disaster-green mr-2">3.</span>
                  <span>Someone claims your request and contacts you</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={() => setShowAuthModal(false)}
        />
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <RequestForm
          onClose={() => setShowRequestForm(false)}
          onSubmit={handleNewRequest}
        />
      )}
    </main>
  )
}
