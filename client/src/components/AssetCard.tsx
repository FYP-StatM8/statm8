import React, { useState } from 'react';
import { Code, Maximize2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AssetCard = ({ imageUrl, code }) => {
    const [showCode, setShowCode] = useState(false);
    const [enlargeImage, setEnlargeImage] = useState(false);

    return (
        <>
            {/* --- Thumbnail Card --- */}
            <div className="relative group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">

                {/* Code Button (Top Right) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent image click
                        setShowCode(true);
                    }}
                    className="absolute top-2 right-2 z-10 p-2 bg-white/90 hover:bg-white text-sky-600 rounded-lg shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="View Source Code"
                >
                    <Code className="h-4 w-4" />
                </button>

                {/* Image Thumbnail */}
                <div
                    className="aspect-square cursor-zoom-in relative"
                    onClick={() => setEnlargeImage(true)}
                >
                    <img
                        src={imageUrl}
                        alt="Analysis Output"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Overlay hint */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                        <Maximize2 className="text-white opacity-0 group-hover:opacity-70 h-8 w-8 drop-shadow-lg" />
                    </div>
                </div>
            </div>

            {/* --- Dialog: View Code --- */}
            <Dialog open={showCode} onOpenChange={setShowCode}>
                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5 text-sky-500" />
                            <span>Generated Python Code</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto bg-slate-900 rounded-lg p-4 mt-2">
                        <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">
                            {code}
                        </pre>
                    </div>
                </DialogContent>
            </Dialog>

            {/* --- Dialog: Enlarge Image --- */}
            <Dialog open={enlargeImage} onOpenChange={setEnlargeImage}>
                <DialogContent className="max-w-5xl h-[90vh] p-0 bg-black/95 border-none flex items-center justify-center">
                    <button
                        onClick={() => setEnlargeImage(false)}
                        className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <img
                        src={imageUrl}
                        alt="Enlarged Analysis"
                        className="max-w-full max-h-full object-contain"
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AssetCard;