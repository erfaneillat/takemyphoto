import { useState, useRef, useCallback } from 'react';

export interface Point {
  x: number;
  y: number;
}

export const useBrushTool = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  }, [brushSize, tool]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
    }
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';
    maskCtx.lineWidth = brushSize;

    if (tool === 'brush') {
      // Draw red overlay
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'; // red-500 with 50% opacity
      ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
      
      // Draw on mask canvas (black and white)
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.strokeStyle = '#FFFFFF';
      maskCtx.fillStyle = '#FFFFFF';
    } else {
      // Eraser
      ctx.globalCompositeOperation = 'destination-out';
      maskCtx.globalCompositeOperation = 'destination-out';
    }

    if (e.type === 'mousedown') {
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();

      maskCtx.beginPath();
      maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      maskCtx.fill();
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);

      maskCtx.lineTo(x, y);
      maskCtx.stroke();
      maskCtx.beginPath();
      maskCtx.moveTo(x, y);
    }
  }, [isDrawing, brushSize, tool]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (canvas && maskCanvas) {
      const ctx = canvas.getContext('2d');
      const maskCtx = maskCanvas.getContext('2d');
      if (ctx && maskCtx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      }
    }
  }, []);

  const getMaskDataUrl = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return null;
    return maskCanvas.toDataURL('image/png');
  }, []);

  return {
    canvasRef,
    maskCanvasRef,
    isDrawing,
    brushSize,
    tool,
    setBrushSize,
    setTool,
    startDrawing,
    stopDrawing,
    draw,
    clearCanvas,
    getMaskDataUrl,
  };
};
