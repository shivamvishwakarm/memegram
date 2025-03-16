export interface RedditMeme {
  _id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  author: string;
  createdAt: string;
  likes: number;
  comments: number;
  permalink: string;
}

export async function fetchMemes(after?: string): Promise<{
  memes: RedditMeme[];
  nextPage: string | null;
}> {
  const subreddits = ['memes', 'dankmemes', 'wholesomememes'];
  const url = `https://www.reddit.com/r/${subreddits.join('+')}/hot.json?limit=25${after ? `&after=${after}` : ''}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const memes = data.data.children
      .filter((post: { data: { url: string; over_18: boolean } }) => {
        // Only take image posts
        const isImage = post.data.url.match(/\.(jpg|jpeg|png|gif)$/i);
        const isSafe = !post.data.over_18;
        return isImage && isSafe;
      })
      .map((post: { data: { id: string; title: string; url: string; author: string; created_utc: number; ups: number; num_comments: number; permalink: string } }) => ({
        _id: post.data.id,
        title: post.data.title,
        mediaUrl: post.data.url,
        mediaType: 'image' as const,
        author: post.data.author,
        createdAt: new Date(post.data.created_utc * 1000).toISOString(),
        likes: post.data.ups,
        comments: post.data.num_comments,
        permalink: `https://reddit.com${post.data.permalink}`
      }));

    return {
      memes,
      nextPage: data.data.after
    };
  } catch (error) {
    console.error('Error fetching memes:', error);
    return { memes: [], nextPage: null };
  }
} 