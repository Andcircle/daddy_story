import React, { useState, useEffect } from 'react';
import { Book, Video, Clock } from 'lucide-react';
import StoryGenerator from './components/StoryGenerator';
import VideoGenerator from './components/VideoGenerator';
import { saveStory, getAllStories } from './utils/db';

function App() {
  const [story, setStory] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [savedStories, setSavedStories] = useState<
    Array<{
      id: string;
      prompt: string;
      story: string;
      videoUrl: string;
      timestamp: number;
    }>
  >([]);

  const removeTitle = (text: string) => {
    return text.replace(/(title|Title):?\s*|\*/gi, '').trim();
  };

  useEffect(() => {
    loadSavedStories();
  }, []);

  const loadSavedStories = async () => {
    try {
      const stories = await getAllStories();
      setSavedStories(stories);
    } catch (error) {
      console.error('Error loading saved stories:', error);
    }
  };

  const handleStoryGenerated = async (newStory: string) => {
    setStory(newStory);
    // if (videoUrl) {
    //   try {
    //     await saveStory(newStory, videoUrl);
    //     await loadSavedStories();
    //   } catch (error) {
    //     console.error('Error saving story:', error);
    //   }
    // }
  };

  const handleVideoGenerated = async (newVideoUrl: string) => {
    setVideoUrl(newVideoUrl);
    if (story) {
      try {
        await saveStory(story, newVideoUrl);
        await loadSavedStories();
      } catch (error) {
        console.error('Error saving story with video:', error);
      }
    }
  };

  const handleLoadSavedStory = (savedStory: {
    id: string;
    prompt: string;
    story: string;
    videoUrl: string;
  }) => {
    setStory(savedStory.story);
    setVideoUrl(savedStory.videoUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-purple-600 mb-8">
        Daddy's Bedtime Story
      </h1>
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
        {story && (
          <VideoGenerator story={story} setVideoUrl={handleVideoGenerated} />
        )}
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
            <h2 className="text-2xl font-semibold text-purple-600">
              Saved Stories
            </h2>
            <ul className="mt-2 space-y-2">
              {savedStories.map((savedStory) => (
                <li
                  key={savedStory.id}
                  className="text-gray-700 cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-200"
                  onClick={() => handleLoadSavedStory(savedStory)}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {removeTitle(savedStory.story).substring(0, 50)}...
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(savedStory.timestamp).toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;