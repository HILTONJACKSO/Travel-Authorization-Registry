'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

interface SignaturePadProps {
    onSave: (signatureDataUrl: string) => void;
    onClear?: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set high resolution for the canvas
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        ctx.strokeStyle = '#07162d';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath(); // Reset path
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);

        setIsEmpty(false);
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setIsEmpty(true);
            if (onClear) onClear();
        }
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (canvas && !isEmpty) {
            onSave(canvas.toDataURL('image/png'));
        }
    };

    return (
        <div className="signature-container bg-white rounded-3 border p-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="small text-uppercase fw-bold text-muted" style={{ letterSpacing: '1px' }}>
                    <i className="bi bi-vector-pen me-2"></i>
                    Official E-Signature
                </span>
                <span className="badge bg-ledger bg-opacity-10 text-ledger border border-ledger border-opacity-25">
                    Identity Verified
                </span>
            </div>

            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-100 border rounded-3 bg-light"
                style={{ height: '200px', cursor: 'crosshair', touchAction: 'none' }}
            />

            <div className="d-flex gap-2 mt-4">
                <Button
                    variant="outline-secondary"
                    className="flex-grow-1 fw-bold py-2"
                    onClick={handleClear}
                >
                    Clear Slate
                </Button>
                <Button
                    variant="ledger"
                    className="flex-grow-1 fw-bold py-2 btn-ledger"
                    onClick={handleSave}
                    disabled={isEmpty}
                >
                    Commit Signature
                </Button>
            </div>
        </div>
    );
};

export default SignaturePad;
