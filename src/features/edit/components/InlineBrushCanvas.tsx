import { useRef, useEffect, useState, useCallback, type ReactNode } from 'react';
import { Paintbrush, Eraser, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';

interface InlineBrushCanvasProps {
  imageUrl: string;
  onMaskChange: (maskDataUrl: string | null) => void;
  overlay?: ReactNode;
}

export const InlineBrushCanvas = ({ imageUrl, onMaskChange, overlay }: InlineBrushCanvasProps) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(32);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load image and setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const cursorCanvas = cursorCanvasRef.current;
    if (!canvas || !maskCanvas || !cursorCanvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;

      // Set canvas dimensions to match container while maintaining aspect ratio
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = Math.min(container.clientHeight, 600);

      let width = img.width;
      let height = img.height;

      // Scale to fit container
      const ratio = Math.min(containerWidth / width, containerHeight / height);
      width = width * ratio;
      height = height * ratio;

      canvas.width = width;
      canvas.height = height;
      maskCanvas.width = width;
      maskCanvas.height = height;
      cursorCanvas.width = width;
      cursorCanvas.height = height;

      setCanvasSize({ width, height });

      // Draw image on main canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }

      // Initialize mask canvas with transparent background
      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        maskCtx.clearRect(0, 0, width, height);
      }

      // Initialize cursor canvas with transparent background
      const cursorCtx = cursorCanvas.getContext('2d');
      if (cursorCtx) {
        cursorCtx.clearRect(0, 0, width, height);
      }

      onMaskChange(null);
    };
    img.src = imageUrl;
    // Only re-init when image changes, not when onMaskChange function identity changes
  }, [imageUrl]);

  const getCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const target = e.currentTarget as HTMLCanvasElement;
    const rect = target.getBoundingClientRect();
    const scaleX = target.width / rect.width;
    const scaleY = target.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }, []);

  const updateMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskDataUrl = maskCanvas.toDataURL('image/png');
    onMaskChange(maskDataUrl);
  }, [onMaskChange]);

  const draw = useCallback((x: number, y: number) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    maskCtx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
    maskCtx.fillStyle = 'rgba(255, 0, 0, 1)'; // Solid red; overall opacity controlled via CSS on the canvas
    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fill();
  }, [brushSize, tool]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (coords) {
      draw(coords.x, coords.y);
    }
  }, [getCoordinates, draw]);

  const drawCursor = useCallback((x: number, y: number) => {
    const cursorCanvas = cursorCanvasRef.current;
    if (!cursorCanvas) return;

    const ctx = cursorCanvas.getContext('2d');
    if (!ctx) return;

    // Clear cursor canvas
    ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

    // Draw red circle cursor
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)'; // red-500 with 80% opacity
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Draw center dot
    ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }, [brushSize]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);
    if (coords) {
      drawCursor(coords.x, coords.y);

      if (isDrawing) {
        draw(coords.x, coords.y);
      }
    }
  }, [isDrawing, getCoordinates, draw, drawCursor]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      updateMask();
    }
  }, [isDrawing, updateMask]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (coords) {
      draw(coords.x, coords.y);
    }
  }, [getCoordinates, draw]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (coords) {
      draw(coords.x, coords.y);
    }
  }, [isDrawing, getCoordinates, draw]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isDrawing) {
      setIsDrawing(false);
      updateMask();
    }
  }, [isDrawing, updateMask]);

  const handleMouseLeave = useCallback(() => {
    const cursorCanvas = cursorCanvasRef.current;
    if (cursorCanvas) {
      const ctx = cursorCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      }
    }
  }, []);

  const handleClear = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    const canvas = canvasRef.current;
    if (!maskCanvas || !canvas || !imageRef.current) return;

    const maskCtx = maskCanvas.getContext('2d');
    const ctx = canvas.getContext('2d');
    if (!maskCtx || !ctx) return;

    // Clear mask
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Redraw main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    onMaskChange(null);
  }, [onMaskChange]);

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-gray-100 dark:bg-surface rounded-xl overflow-hidden flex items-center justify-center"
      >
        <div
          className="relative"
          style={canvasSize ? { width: canvasSize.width, height: canvasSize.height } : undefined}
        >
          {/* Base image canvas (no input handlers) */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
          />
          {/* Mask canvas overlay (handles drawing) */}
          <canvas
            ref={maskCanvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="absolute inset-0 cursor-crosshair touch-none opacity-50"
          />
          {/* Cursor canvas overlay (shows brush cursor) */}
          <canvas
            ref={cursorCanvasRef}
            className="absolute inset-0 pointer-events-none"
          />
          {overlay && (
            <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-10">
              {overlay}
            </div>
          )}
        </div>
      </div>

      {/* Tools */}
      <div className="flex-shrink-0 bg-gray-50 dark:bg-surface-card rounded-xl p-3 md:p-4 border border-gray-200 dark:border-border-light space-y-3 md:space-y-4">
        {/* Tool Selection */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[48px] md:min-w-[60px]">
            {t('edit.brushTool.tool')}:
          </span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTool('brush')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${tool === 'brush'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-surface-hover'
                }`}
            >
              <Paintbrush size={16} />
              <span className="text-sm font-medium">{t('edit.brushTool.brush')}</span>
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${tool === 'eraser'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-surface-hover'
                }`}
            >
              <Eraser size={16} />
              <span className="text-sm font-medium">{t('edit.brushTool.eraser')}</span>
            </button>
          </div>
          <button
            onClick={handleClear}
            className="ml-0 md:ml-auto w-full md:w-auto flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-gray-100 dark:bg-surface hover:bg-gray-200 dark:hover:bg-surface-hover text-gray-900 dark:text-white rounded-lg transition-all"
          >
            <RotateCcw size={16} />
            <span className="text-sm font-medium">{t('edit.brushTool.clear')}</span>
          </button>
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[48px] md:min-w-[60px]">
            {t('edit.brushTool.size')}:
          </span>
          <input
            type="range"
            min="5"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="flex-1 min-w-[160px] h-2 bg-gray-200 dark:bg-surface rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
            {brushSize}px
          </span>
        </div>
      </div>
    </div>
  );
};
