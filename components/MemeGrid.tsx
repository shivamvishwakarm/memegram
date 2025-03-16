"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import MemeCard from "./MemeCard";
import { fetchMemes, type RedditMeme } from "@/utils/memeService";

export default function MemeGrid() {
  const [memes, setMemes] = useState<RedditMeme[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleMemeIndex, setVisibleMemeIndex] = useState(0);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const scrollDiv = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const lastScrollTime = useRef(Date.now());
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchMoreMemes = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchMemes(nextPage || undefined);
      setMemes((prevMemes) => [...prevMemes, ...data.memes]);
      setNextPage(data.nextPage);
      setHasInitialLoad(true);
    } catch (error) {
      console.error("Error fetching memes:", error);
      setError("Failed to fetch memes");
    } finally {
      setLoading(false);
    }
  }, [loading, nextPage]);

  // Initial load
  useEffect(() => {
    if (!hasInitialLoad && !loading) {
      fetchMoreMemes();
    }
  }, [hasInitialLoad, loading, fetchMoreMemes]);

  const scrollToMeme = useCallback(
    (index: number) => {
      if (!scrollDiv.current) return;

      const targetIndex = Math.max(0, Math.min(index, memes.length - 1));
      const viewportHeight = window.innerHeight;

      scrollDiv.current.scrollTo({
        top: targetIndex * viewportHeight,
        behavior: "smooth",
      });

      setVisibleMemeIndex(targetIndex);
      isScrolling.current = true;

      setTimeout(() => {
        isScrolling.current = false;
      }, 500);
    },
    [memes.length]
  );

  const handleScroll = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      // Prevent rapid scrolling
      const now = Date.now();
      if (now - lastScrollTime.current < 200 || isScrolling.current) return;
      lastScrollTime.current = now;

      const SCROLL_THRESHOLD = 20; // Adjust this value to change sensitivity
      const scrollDelta = Math.abs(e.deltaY);

      // Only trigger scroll if the delta is above the threshold
      if (scrollDelta >= SCROLL_THRESHOLD) {
        const direction = e.deltaY > 0 ? 1 : -1;
        scrollToMeme(visibleMemeIndex + direction);
      }
    },
    [visibleMemeIndex, scrollToMeme]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();

        if (isScrolling.current) return;

        const direction = e.key === "ArrowDown" ? 1 : -1;
        scrollToMeme(visibleMemeIndex + direction);
      }
    },
    [visibleMemeIndex, scrollToMeme]
  );

  // Handle touch events for mobile
  const touchStart = useRef<number | null>(null);
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (touchStart.current === null) return;

      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStart.current - touchEnd;

      // Require a minimum swipe distance
      if (Math.abs(diff) > 50) {
        const direction = diff > 0 ? 1 : -1;
        scrollToMeme(visibleMemeIndex + direction);
      }

      touchStart.current = null;
    },
    [visibleMemeIndex, scrollToMeme]
  );

  useEffect(() => {
    const currentScrollDiv = scrollDiv.current;
    if (currentScrollDiv) {
      currentScrollDiv.addEventListener("wheel", handleScroll, {
        passive: false,
      });
      currentScrollDiv.addEventListener("touchstart", handleTouchStart);
      currentScrollDiv.addEventListener("touchend", handleTouchEnd);
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        currentScrollDiv.removeEventListener("wheel", handleScroll);
        currentScrollDiv.removeEventListener("touchstart", handleTouchStart);
        currentScrollDiv.removeEventListener("touchend", handleTouchEnd);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [handleScroll, handleKeyDown, handleTouchStart, handleTouchEnd]);

  // Add auto-scroll effect
  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollInterval.current = setInterval(() => {
        if (!isScrolling.current && visibleMemeIndex < memes.length - 1) {
          scrollToMeme(visibleMemeIndex + 1);
        } else if (visibleMemeIndex >= memes.length - 1) {
          // Stop auto-scroll when reaching the end
          setIsAutoScrolling(false);
        }
      }, 3000); // Scroll every 3 seconds
    } else {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
    }

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [isAutoScrolling, visibleMemeIndex, memes.length, scrollToMeme]);

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!hasInitialLoad) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      ref={scrollDiv}
      id="scrollableDiv"
      className="h-screen overflow-y-auto" // Use overflow-y-auto to allow scrolling
    >
      <InfiniteScroll
        dataLength={memes.length}
        next={fetchMoreMemes}
        hasMore={!!nextPage}
        loader={
          <div className="flex justify-center items-center h-screen bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
          </div>
        }
        endMessage={
          <div className="flex justify-center items-center h-screen bg-black">
            <p className="text-white text-lg">No more memes to show</p>
          </div>
        }
        scrollableTarget="scrollableDiv">
        {memes.map((meme, index) => (
          <div
            key={meme._id}
            className="h-screen flex items-center justify-center">
            <MemeCard meme={meme} isVisible={index === visibleMemeIndex} />
          </div>
        ))}
      </InfiniteScroll>

      {/* Auto-scroll toggle button */}
      <button
        onClick={() => setIsAutoScrolling((prev) => !prev)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-200 ${
          isAutoScrolling
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-800 hover:bg-gray-700"
        }`}>
        <div
          className={`w-2 h-2 rounded-full ${
            isAutoScrolling ? "bg-red-500 animate-pulse" : "bg-gray-400"
          }`}
        />
        <span className="text-white text-sm font-medium">
          {isAutoScrolling ? "Stop" : "Auto-scroll"}
        </span>
      </button>
    </div>
  );
}
