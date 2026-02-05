import React, { useState, useEffect, useRef } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { VideoItem } from '../types';
import VideoModal from './VideoModal';

interface VideoMarqueeProps {
  videos: VideoItem[];
  direction?: 'left' | 'right';
  title: string;
}

const VideoMarquee: React.FC<VideoMarqueeProps> = ({ videos, direction = 'left', title }) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef<number>(0); // Ref để theo dõi vị trí chính xác (float) tránh lỗi làm tròn trên iOS
  
  // Sử dụng useRef cho trạng thái tương tác để đảm bảo phản hồi tức thì trong vòng lặp animation
  const isInteracting = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  // Nhân bản danh sách 4 lần để đảm bảo không gian cuộn vô tận
  const trackVideos = [...videos, ...videos, ...videos, ...videos];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Đặt vị trí ban đầu ở Set thứ 2 để người dùng có thể cuộn lùi ngay lập tức
    if (scrollContainer.scrollLeft === 0) {
       // Sử dụng setTimeout để đảm bảo layout đã render xong
       setTimeout(() => {
         const singleSetWidth = scrollContainer.scrollWidth / 4;
         scrollContainer.scrollLeft = singleSetWidth;
         scrollPosRef.current = singleSetWidth;
       }, 100);
    } else {
        scrollPosRef.current = scrollContainer.scrollLeft;
    }

    let animationFrameId: number;
    const speed = direction === 'left' ? 0.6 : -0.6;

    const animate = () => {
      if (!scrollContainer) return;

      const singleSetWidth = scrollContainer.scrollWidth / 4;

      // Nếu đang tương tác (chạm/click/scroll thủ công), đồng bộ ref theo vị trí thực tế của user
      if (isInteracting.current) {
        scrollPosRef.current = scrollContainer.scrollLeft;
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // Tính toán vị trí tiếp theo dựa trên biến Ref (không dựa vào DOM để tránh lỗi làm tròn trên iOS)
      let newPos = scrollPosRef.current + speed;

      // Logic vòng lặp vô tận (Infinite Loop)
      if (newPos >= singleSetWidth * 3) {
        // Reset về set 1 (giữ nguyên vị trí tương đối)
        newPos = singleSetWidth + (newPos - singleSetWidth * 3);
      }
      else if (newPos <= singleSetWidth * 0.5) {
        // Reset về set 2
        newPos = singleSetWidth * 2.5 - (singleSetWidth * 0.5 - newPos);
      }

      // Cập nhật cả Ref và DOM
      scrollPosRef.current = newPos;
      scrollContainer.scrollLeft = newPos;

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [direction, videos]);

  // Event Handlers
  const onInteractStart = () => {
    isInteracting.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const onInteractEnd = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      isInteracting.current = false;
    }, 2000);
  };

  // Hàm xử lý khi bấm nút điều hướng
  const handleManualScroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    // Dừng auto-scroll ngay lập tức
    onInteractStart();

    const container = scrollRef.current;
    // Lấy chiều rộng thẻ đầu tiên để tính khoảng cách cuộn (cộng thêm gap ước lượng)
    const firstCard = container.firstElementChild as HTMLElement;
    const scrollAmount = firstCard ? firstCard.offsetWidth + 20 : 300; 

    const targetScroll = dir === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
    
    // Cập nhật ref ngay lập tức để tránh giật khi animation chạy lại
    scrollPosRef.current = targetScroll;

    // Kích hoạt lại auto-scroll sau khi cuộn xong (khoảng 1s)
    onInteractEnd();
  };

  return (
    <div className="py-6 md:py-12 relative select-none group/container">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-5 md:mb-10 flex justify-between items-end">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-8 md:w-16 h-[1px] bg-gradient-to-r from-orange-500 to-pink-500 opacity-60"></div>
          <h3 className="text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.4em] opacity-70">
            {title}
          </h3>
        </div>
        
        {/* Navigation Buttons (Desktop visible, Mobile optional) */}
        <div className="hidden md:flex gap-2">
          <button 
            onClick={() => handleManualScroll('left')}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-orange-600 hover:border-orange-600 flex items-center justify-center text-white transition-all active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => handleManualScroll('right')}
            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-orange-600 hover:border-orange-600 flex items-center justify-center text-white transition-all active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Container wrapper for absolute buttons on mobile/tablet overlay */}
      <div className="relative">
        {/* Mobile Overlay Buttons (Left) */}
        <button 
            onClick={(e) => { e.stopPropagation(); handleManualScroll('left'); }}
            className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 opacity-0 group-hover/container:opacity-100 transition-opacity duration-300"
        >
            <ChevronLeft size={16} />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto overflow-y-hidden px-4 md:px-6 pb-4 
                    [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] 
                    cursor-grab active:cursor-grabbing touch-pan-x"
          onMouseEnter={onInteractStart}
          onMouseLeave={onInteractEnd}
          onTouchStart={onInteractStart}
          onTouchMove={onInteractStart}
          onTouchEnd={onInteractEnd}
        >
          {trackVideos.map((video, idx) => (
            <div 
              key={`${video.id}-${idx}`}
              className={`relative flex-shrink-0 group cursor-pointer overflow-hidden rounded-2xl border border-white/5 shadow-2xl transition-all duration-500 hover:scale-[0.98] transform-gpu ${
                video.type === 'short' ? 'w-[160px] h-[280px] md:w-[240px] md:h-[420px]' : 'w-[280px] h-[158px] md:w-[450px] md:h-[253px]'
              }`}
              onClick={() => setSelectedVideo(video.youtubeId)}
            >
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                loading="lazy" 
                decoding="async"
                className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-in-out pointer-events-none select-none"
                draggable="false"
              />
              
              {/* Dark Overlay - Hidden by default, shows on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              {/* Play Button - Hidden by default, shows on hover */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:bg-orange-600 hover:border-orange-600">
                    <Play fill="currentColor" size={16} className="ml-0.5 md:ml-1 md:w-6 md:h-6" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                <p className="text-[10px] font-bold text-white/90 tracking-[0.2em] truncate uppercase">{video.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Overlay Buttons (Right) */}
        <button 
            onClick={(e) => { e.stopPropagation(); handleManualScroll('right'); }}
            className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 opacity-0 group-hover/container:opacity-100 transition-opacity duration-300"
        >
            <ChevronRight size={16} />
        </button>
      </div>

      <VideoModal 
        isOpen={!!selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
        youtubeId={selectedVideo || ''} 
      />
    </div>
  );
};

export default VideoMarquee;