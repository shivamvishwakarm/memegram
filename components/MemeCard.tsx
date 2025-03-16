"use client";
import { useState } from 'react';
import Image from 'next/image';
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import type { RedditMeme } from '@/utils/memeService';
import { formatDistanceToNow } from 'date-fns';

interface MemeCardProps {
  meme: RedditMeme;
  isVisible: boolean;
}

export default function MemeCard({ meme, isVisible }: MemeCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(meme.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: meme.title,
        url: meme.permalink
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="relative w-full h-[85%] bg-black">
      {meme.mediaType === 'video' ? (
        <video
          src={meme.mediaUrl}
          className="w-full h-full object-contain"
          controls={isVisible}
          autoPlay={isVisible}
          loop
          muted
          playsInline
        />
      ) : (
        <Image
          src={meme.mediaUrl}
          alt={meme.title}
          fill
          className="object-contain"
          priority={isVisible}
        />
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <h2 className="text-white text-lg font-semibold mb-2">{meme.title}</h2>
        <p className="text-gray-200 text-sm mb-3">
          Posted by u/{meme.author} • {formatDistanceToNow(new Date(meme.createdAt))} ago
        </p>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-white"
          >
            {isLiked ? (
              <HeartSolidIcon className="w-6 h-6 text-red-500" />
            ) : (
              <HeartIcon className="w-6 h-6" />
            )}
            <span>{likesCount.toLocaleString()}</span>
          </button>

          <a
            href={meme.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-white"
          >
            <ChatBubbleLeftIcon className="w-6 h-6" />
            <span>{meme.comments.toLocaleString()}</span>
          </a>

          <button
            onClick={handleShare}
            className="flex items-center text-white"
          >
            <ShareIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
} 