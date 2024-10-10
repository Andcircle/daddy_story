import React, { useState, useEffect } from 'react'
import { Wand2 } from 'lucide-react'

interface StoryGeneratorProps {
  setStory: (story: string) => void
}

const StoryGenerator: React.FC<StoryGeneratorProps> = ({ setStory }) => {
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const cachedPrompt = localStorage.getItem('cachedPrompt')
    if (cachedPrompt) {
      setPrompt(cachedPrompt)
    }
  }, [])

  const generateStory = async (prompt: string) => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Sending request to OpenAI API...')
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "chatgpt-4o-latest",
          messages: [
            { role: "system", content: "You are a creative children's story writer. Create a short, engaging bedtime story suitable for kids." },
            { role: "user", content: prompt }
          ]
        })
      })
      
      console.log('Response received:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('API Response:', data)
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Unexpected API response format')
      }
      
      const generatedStory = data.choices[0].message.content
      setStory(generatedStory)
      localStorage.setItem('cachedPrompt', prompt)
    } catch (error) {
      console.error('Error generating story:', error)
      setError(`Failed to generate story: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateStory(prompt)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Enter a story idea:
        </label>
        <input
          type="text"
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          placeholder="e.g., A friendly dragon who can't breathe fire"
        />
      </div>
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        {isLoading ? (
          'Generating...'
        ) : (
          <>
            <Wand2 className="mr-2" />
            Generate Story
          </>
        )}
      </button>
    </form>
  )
}

export default StoryGenerator