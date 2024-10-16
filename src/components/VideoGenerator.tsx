import React, { useState } from 'react'
import { Video } from 'lucide-react'

interface VideoGeneratorProps {
  story: string
  setVideoUrl: (url: string) => void
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ story, setVideoUrl }) => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)

  const generateVideo = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Sending request to HeyGen API...')
      const truncatedStory = story.slice(0, 1990) + (story.length > 1990 ? '...' : '')
      const payload = {
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: "175bbfcd0b2e4b7b90d1588a7a815a50",
              avatar_style: "normal"
            },
            voice: {
              type: "text",
              input_text: truncatedStory,
              voice_id: "102c45689f6a437f81b3b61d3e7ece82"
            },
            background: {
              type: "color",
              value: "#E6E6FA" // Light lavender color
            }
          }
        ],
        dimension: {
          width: 1280,
          height: 720
        },
        aspect_ratio: "16:9",
        test: false // Set to true for testing, false for production
      }

      const response = await fetch('https://api.heygen.com/v2/video/generate', {
        method: 'POST',
        headers: {
          'X-Api-Key': import.meta.env.VITE_HEYGEN_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      console.log('Response received:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        if (errorData.error && errorData.error.code === 'trial_video_limit_exceeded') {
          throw new Error('Daily API trial limit exceeded. Please try again tomorrow.')
        }
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('API Response:', data)
      
      if (!data.data || !data.data.video_id) {
        throw new Error('Unexpected API response format: missing video_id')
      }

      setVideoId(data.data.video_id)
      await checkVideoStatus(data.data.video_id)

      // const test_id = '2fd0ff11fde446d69589e293cb019a56'

      // setVideoId(test_id)
      // await checkVideoStatus(test_id)
    } catch (error) {
      console.error('Error generating video:', error)
      setError(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkVideoStatus = async (id: string) => {
    try {
      const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${id}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': import.meta.env.VITE_HEYGEN_API_KEY,
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Video status:', data)

      if (data.data.status === 'completed') {
        setVideoUrl(data.data.video_url)
        console.log(data.data.video_url)
      } else if (data.data.status === 'failed') {
        throw new Error('Video generation failed')
      } else {
        // If the video is still processing, check again after a delay
        setTimeout(() => checkVideoStatus(id), 5000) // Check every 5 seconds
      }
    } catch (error) {
      console.error('Error checking video status:', error)
      setError(`Failed to check video status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="mt-6">
      {error && (
        <div className="text-red-600 text-sm mb-2">{error}</div>
      )}
      <button
        onClick={generateVideo}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        {isLoading ? (
          'Generating Video...'
        ) : (
          <>
            <Video className="mr-2" />
            Generate Video Narration
          </>
        )}
      </button>
      {videoId && isLoading && (
        <p className="text-blue-600 text-sm mt-2">
          Video is being processed. Please wait...
        </p>
      )}
      {story.length > 2000 && (
        <p className="text-yellow-600 text-sm mt-2">
          Note: The story has been truncated to 2000 characters for video generation.
        </p>
      )}
    </div>
  )
}

export default VideoGenerator