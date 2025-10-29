import { useRef, useEffect, useState, useCallback } from 'react';
import { Paintbrush, Eraser, RotateCcw, X } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';

interface BrushCanvasProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (maskDataUrl: string) => void;
}

export const BrushCanvas = ({ imageUrl, onClose, onSave }: BrushCanvasProps) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load image and setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      
      // Set canvas dimensions to match image
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.width;
      let height = img.height;
      
      // Scale down if needed
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      maskCanvas.width = width;
      maskCanvas.height = height;
      
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
      
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const getCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

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

  const draw = useCallback((x: number, y: number) => {
    const maskCanvas = maskCanvasRef.current;
    const canvas = canvasRef.current;
    if (!maskCanvas || !canvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    const ctx = canvas.getContext('2d');
    if (!maskCtx || !ctx || !imageRef.current) return;

    // Draw on mask canvas
    maskCtx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
    maskCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fill();

    // Redraw main canvas with image and mask overlay
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(maskCanvas, 0, 0);
  }, [brushSize, tool]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (coords) {
      draw(coords.x, coords.y);
    }
  }, [getCoordinates, draw]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (coords) {
      draw(coords.x, coords.y);
    }
  }, [isDrawing, getCoordinates, draw]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

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
    setIsDrawing(false);
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
  }, []);

  const handleSave = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    // Get mask data URL
    const maskDataUrl = maskCanvas.toDataURL('image/png');
    onSave(maskDataUrl);
  }, [onSave]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-card rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-border-light transition-colors flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border-light">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('edit.brushTool.title')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-surface rounded-lg transition-all"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50 dark:bg-surface">
          <div className="relative">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="border-2 border-gray-300 dark:border-border-light rounded-lg cursor-crosshair touch-none"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            <canvas
              ref={maskCanvasRef}
              className="hidden"
            />
          </div>
        </div>

        {/* Tools */}
        <div className="p-4 border-t border-gray-200 dark:border-border-light bg-white dark:bg-surface-card">
          <div className="flex flex-col gap-4">
            {/* Tool Selection */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('edit.brushTool.tool')}:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setTool('brush')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    tool === 'brush'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-surface-hover'
                  }`}
                >
                  <Paintbrush size={16} />
                  <span className="text-sm font-medium">{t('edit.brushTool.brush')}</span>
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    tool === 'eraser'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-surface-hover'
                  }`}
                >
                  <Eraser size={16} />
                  <span className="text-sm font-medium">{t('edit.brushTool.eraser')}</span>
                </button>
              </div>
            </div>

            {/* Brush Size */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('edit.brushTool.size')}:
              </span>
              <input
                type="range"
                min="5"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-surface rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                {brushSize}px
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-surface hover:bg-gray-200 dark:hover:bg-surface-hover text-gray-900 dark:text-white rounded-lg transition-all"
              >
                <RotateCcw size={16} />
                <span className="text-sm font-medium">{t('edit.brushTool.clear')}</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-surface hover:bg-gray-200 dark:hover:bg-surface-hover text-gray-900 dark:text-white rounded-lg transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={!imageLoaded}
                className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {t('edit.brushTool.apply')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
