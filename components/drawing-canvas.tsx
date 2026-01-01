"use client"

import { useRef, useEffect, useState, useCallback } from 'react'

interface DrawingCanvasProps {
    isDrawing: boolean
    drawMode: 'none' | 'rectangle' | 'circle' | 'polygon'
    onDrawComplete: (bounds: {
        startX: number; startY: number;
        endX: number; endY: number;
        type: 'rectangle' | 'circle'
    }) => void
}

export function DrawingCanvas({ isDrawing, drawMode, onDrawComplete }: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
    const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    // Draw the selection shape
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (!startPoint || !currentPoint || !isDragging) return

        // Set drawing style
        ctx.strokeStyle = '#3b82f6'  // Blue
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'  // Semi-transparent blue

        if (drawMode === 'rectangle') {
            const x = Math.min(startPoint.x, currentPoint.x)
            const y = Math.min(startPoint.y, currentPoint.y)
            const width = Math.abs(currentPoint.x - startPoint.x)
            const height = Math.abs(currentPoint.y - startPoint.y)

            ctx.fillRect(x, y, width, height)
            ctx.strokeRect(x, y, width, height)
        } else if (drawMode === 'circle') {
            const centerX = startPoint.x
            const centerY = startPoint.y
            const dx = currentPoint.x - startPoint.x
            const dy = currentPoint.y - startPoint.y
            const radius = Math.sqrt(dx * dx + dy * dy)

            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
            ctx.fill()
            ctx.stroke()
        }
    }, [startPoint, currentPoint, isDragging, drawMode])

    // Resize canvas to match container
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const resizeCanvas = () => {
            const parent = canvas.parentElement
            if (parent) {
                canvas.width = parent.clientWidth
                canvas.height = parent.clientHeight
            }
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)
        return () => window.removeEventListener('resize', resizeCanvas)
    }, [])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (drawMode === 'none') return

        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setStartPoint({ x, y })
        setCurrentPoint({ x, y })
        setIsDragging(true)
    }, [drawMode])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || drawMode === 'none') return

        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setCurrentPoint({ x, y })
    }, [isDragging, drawMode])

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !startPoint || drawMode === 'none') return

        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const endX = e.clientX - rect.left
        const endY = e.clientY - rect.top

        // Only trigger if there was significant movement
        if (Math.abs(endX - startPoint.x) > 10 && Math.abs(endY - startPoint.y) > 10) {
            onDrawComplete({
                startX: startPoint.x,
                startY: startPoint.y,
                endX,
                endY,
                type: drawMode as 'rectangle' | 'circle'
            })
        }

        setIsDragging(false)
        setStartPoint(null)
        setCurrentPoint(null)

        // Clear canvas after a short delay
        setTimeout(() => {
            const canvas = canvasRef.current
            if (canvas) {
                const ctx = canvas.getContext('2d')
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
            }
        }, 100)
    }, [isDragging, startPoint, drawMode, onDrawComplete])

    // Only show canvas when in a draw mode
    if (drawMode === 'none') return null

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-10 cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
    )
}
