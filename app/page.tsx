"use client";
import MemeGrid from "@/components/MemeGrid";
// import UploadButton from '@/components/UploadButton';

export default function Home() {
  return (
    <main className="h-screen overflow-hidden bg-black relative">
      {/* Floating header */}
      {/* <UploadButton/> */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">Memegram</h1>
        </div>
      </div>

      {/* Full-screen meme feed */}
      <MemeGrid />
    </main>
  );
}
