'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/hooks/useUser'
import { votingApiService, CityVote, VoteSummary } from '@/lib/votingApiService'
import { 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  MessageCircle, 
  User,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface CityReviewSystemApiProps {
  cityId: string
  cityName: string
  className?: string
}

export default function CityReviewSystemApi({ 
  cityId, 
  cityName, 
  className = '' 
}: CityReviewSystemApiProps) {
  const { t } = useTranslation()
  const { user } = useUser()
  const [userVote, setUserVote] = useState<CityVote | null>(null)
  const [voteSummary, setVoteSummary] = useState<VoteSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    content: '',
    rating: 5
  })

  useEffect(() => {
    loadVoteData()
  }, [cityId, user?.id])

  const loadVoteData = async () => {
    try {
      setLoading(true)
      
      // Load user's vote if logged in
      if (user?.id) {
        const vote = await votingApiService.getUserCityVote(cityId, user.id)
        setUserVote(vote)
      }

      // Load vote summary
      const summary = await votingApiService.getVoteSummary(cityId, 'city')
      setVoteSummary(summary)
    } catch (error) {
      console.error('Error loading vote data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (voteType: 'upvote' | 'downvote' | 'neutral') => {
    if (!user?.id) {
      alert(t('auth.loginRequired', 'Please login to vote'))
      return
    }

    try {
      setVoting(true)
      const result = await votingApiService.toggleCityVote(cityId, user.id, voteType)
      setUserVote(result)
      
      // Reload vote summary
      await loadVoteData()
    } catch (error) {
      console.error('Error voting:', error)
      alert(t('error.voteFailed', 'Failed to submit vote'))
    } finally {
      setVoting(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      // In a real app, you would submit the review to an API
      alert(t('review.submitted', 'Review submitted successfully!'))
      setNewReview({ content: '', rating: 5 })
      setShowReviewForm(false)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert(t('error.reviewFailed', 'Failed to submit review'))
    }
  }

  const getVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0
    return Math.round((votes / total) * 100)
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('cityReview.title', 'City Reviews')}
          </h2>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{cityName}</span>
          </div>
        </div>
        
        <button
          onClick={() => setShowReviewForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {t('cityReview.writeReview', 'Write Review')}
        </button>
      </div>

      {/* Vote Summary */}
      {voteSummary && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {voteSummary.total_votes}
              </div>
              <div className="text-sm text-gray-600">
                {t('cityReview.totalVotes', 'Total Votes')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {voteSummary.upvotes}
              </div>
              <div className="text-sm text-gray-600">
                {t('cityReview.upvotes', 'Upvotes')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {voteSummary.downvotes}
              </div>
              <div className="text-sm text-gray-600">
                {t('cityReview.downvotes', 'Downvotes')}
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRatingColor(voteSummary.average_rating)}`}>
                {voteSummary.average_rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">
                {t('cityReview.averageRating', 'Average Rating')}
              </div>
            </div>
          </div>

          {/* Vote Progress Bars */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                {t('cityReview.positive', 'Positive')}
              </span>
              <span>{getVotePercentage(voteSummary.upvotes, voteSummary.total_votes)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getVotePercentage(voteSummary.upvotes, voteSummary.total_votes)}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600">
                <TrendingDown className="w-4 h-4 inline mr-1" />
                {t('cityReview.negative', 'Negative')}
              </span>
              <span>{getVotePercentage(voteSummary.downvotes, voteSummary.total_votes)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getVotePercentage(voteSummary.downvotes, voteSummary.total_votes)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Voting Buttons */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => handleVote('upvote')}
          disabled={voting}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            userVote?.vote_type === 'upvote'
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsUp className="w-5 h-5" />
          {t('cityReview.upvote', 'Upvote')}
        </button>
        
        <button
          onClick={() => handleVote('neutral')}
          disabled={voting}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            userVote?.vote_type === 'neutral'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Star className="w-5 h-5" />
          {t('cityReview.neutral', 'Neutral')}
        </button>
        
        <button
          onClick={() => handleVote('downvote')}
          disabled={voting}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            userVote?.vote_type === 'downvote'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          } ${voting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsDown className="w-5 h-5" />
          {t('cityReview.downvote', 'Downvote')}
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {t('cityReview.writeReview', 'Write a Review')}
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('cityReview.rating', 'Rating')}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                    className={`w-8 h-8 rounded-full transition-colors ${
                      rating <= newReview.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('cityReview.comment', 'Comment')}
              </label>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder={t('cityReview.commentPlaceholder', 'Share your experience...')}
                required
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('cityReview.submit', 'Submit Review')}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Reviews */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {t('cityReview.recentReviews', 'Recent Reviews')}
        </h3>
        <div className="space-y-4">
          {/* Mock reviews - in real app, fetch from API */}
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">John Doe</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">2 days ago</span>
            </div>
            <p className="text-gray-700">
              Great city for digital nomads! Excellent wifi, affordable cost of living, and friendly locals.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Jane Smith</span>
              <div className="flex">
                {[1, 2, 3, 4].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <Star className="w-4 h-4 text-gray-300" />
              </div>
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">1 week ago</span>
            </div>
            <p className="text-gray-700">
              Good place to work remotely. The co-working spaces are well-equipped and the community is welcoming.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
