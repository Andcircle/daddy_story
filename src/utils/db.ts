import { openDB, DBSchema } from 'idb';

interface MyDB extends DBSchema {
  stories: {
    key: string;
    value: {
      story: string;
      videoUrl: string;
      timestamp: number;
    };
  };
}

const dbPromise = openDB<MyDB>('StoryDB', 1, {
  upgrade(db) {
    db.createObjectStore('stories', { keyPath: 'timestamp' });
  },
});

export async function saveStory(story: string, videoUrl: string) {
  const db = await dbPromise;
  const timestamp = Date.now();
  await db.put('stories', {
    story,
    videoUrl,
    timestamp,
  });
}

export async function getStory(timestamp: number) {
  const db = await dbPromise;
  return db.get('stories', timestamp);
}

export async function getAllStories() {
  const db = await dbPromise;
  return db.getAll('stories');
}
