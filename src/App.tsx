import React, { useState, useEffect } from 'react'
import { Book, Video } from 'lucide-react'
import StoryGenerator from './components/StoryGenerator'
import VideoGenerator from './components/VideoGenerator'
import { saveStory, getAllStories } from './utils/db'

function App() {
  const [story, setStory] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [savedStories, setSavedStories] = useState<Array<{ prompt: string; story: string; videoUrl: string }>>([])

  const removeTitle = (text: string) => {
    return text.replace(/(title|Title):?\s*|\*/gi, '').trim()
  }

  useEffect(() => {
    loadSavedStories()
  }, [])

  const loadSavedStories = async () => {
    try {
      const stories = await getAllStories()
      setSavedStories(stories)
    } catch (error) {
      console.error('Error loading saved stories:', error)
    }
  }

  const handleStoryGenerated = async (newStory: string, prompt: string) => {
    setStory(newStory)
    if (videoUrl) {
      try {
        await saveStory(prompt, newStory, videoUrl)
        await loadSavedStories()
      } catch (error) {
        console.error('Error saving story:', error)
      }
    }
  }

  const handleVideoGenerated = async (newVideoUrl: string) => {
    setVideoUrl(newVideoUrl)
    if (story) {
      try {
        await saveStory('', story, newVideoUrl) // Using an empty string as prompt for now
        await loadSavedStories()
      } catch (error) {
        console.error('Error saving story with video:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-purple-600 mb-8">Daddy's Bedtime Story</h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <StoryGenerator setStory={handleStoryGenerated} />
        {story && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-purple-600 flex items-center">
              <Book className="mr-2" /> Your Bedtime Story
            </h2>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{story}</p>
          </div>
        )}
        {story && <VideoGenerator story={story} setVideoUrl={handleVideoGenerated} />}
        {videoUrl && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-purple-600 flex items-center">
              <Video className="mr-2" /> Story Video
            </h2>
            <video className="mt-2 w-full rounded" controls src={videoUrl}>
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        {savedStories.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-purple-600">Saved Stories</h2>
            <ul className="mt-2 space-y-2">
              {savedStories.map((savedStory, index) => (
                <li key={index} className="text-gray-700">
                  <strong>{'Title'}</strong>: {removeTitle(savedStory.story).substring(0, 50)}...
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default App