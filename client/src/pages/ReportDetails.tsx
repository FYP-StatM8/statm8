import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReportItem from '@/components/ReportItem';
import AssetCard from '@/components/AssetCard'; // Import new component
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { ArrowLeft, MessageSquare, Eye, Loader2 } from "lucide-react";
import AuthNavigation from "@/components/AuthNavigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ReportDetails = () => {
    const { user } = useAuth();
    const { reportid } = useParams();
    const navigate = useNavigate();

    // --- State: Report ---
    const [reportData, setReportData] = useState(null);
    const [loadingReport, setLoadingReport] = useState(true);
    const [error, setError] = useState(null);

    // --- State: Comments ---
    const [comments, setComments] = useState([]);
    
    // --- State: Assets Dialog ---
    const [selectedComment, setSelectedComment] = useState(null);
    const [commentAssets, setCommentAssets] = useState([]);
    const [loadingAssets, setLoadingAssets] = useState(false);

    // 1. Fetch Report Data 
    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoadingReport(true);
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/storage/csv/user/${user.uid}/${reportid}`);
                
                if (!response.ok) throw new Error("Report not found");

                const data = await response.json();
                setReportData(data.csvs[0]);
            } catch (err) {
                console.error(err);
                setError("Could not load report.");
            } finally {
                setLoadingReport(false);
            }
        };

        if (reportid && user?.uid) fetchReport();
    }, [reportid, user]);

    // 2. Fetch Comments
    useEffect(() => {
        const fetchComments = async () => {
            try {
                // API: /storage/csv/{reportid}/comments
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/storage/csv/${reportid}/comments`);
                const data = await response.json();
                // Ensure we set an array
                setComments(Array.isArray(data) ? data : data.comments || []); 
            } catch (err) {
                console.error("Failed to load comments", err);
            }
        };

        if (reportid) fetchComments();
    }, [reportid]);

    // 3. Handle View Assets Click
    const handleViewCommentAssets = async (comment) => {
        setSelectedComment(comment);
        setLoadingAssets(true);
        setCommentAssets([]); // Reset previous assets
        
        try {
            // API: /storage/csv/comment/{comment_id}/assets
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/storage/csv/comment/${comment._id}/assets`);
            const data = await response.json();
            setCommentAssets(data.assets || []);
        } catch (error) {
            console.error("Failed to load assets", error);
        } finally {
            setLoadingAssets(false);
        }
    };

    if (loadingReport) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 text-sky-500">
                <Loader2 className="animate-spin h-10 w-10 text-sky-500" />
            </div>
        );
    }

    if (error || !reportData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Report Not Found</h2>
                <Button variant="outline" onClick={() => navigate('/my-reports')}>
                    Back to My Reports
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <AuthNavigation />
            
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
                 <Button
                    variant="ghost"
                    className="gap-2 text-gray-500 hover:text-sky-500 hover:bg-sky-50"
                    onClick={() => navigate('/my-reports')}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>

            {/* Main Report Visualization */}
            <ReportItem report={reportData} />

            {/* --- Comments Section --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-12">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-4">
                    <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Analysis Comments & Charts</h2>
                </div>

                {comments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {comments.map((comment) => (
                            <div key={comment._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between group">
                                <div>
                                    {/* Handle text display if comment has no text */}
                                    <p className="text-gray-700 mb-4 text-sm leading-relaxed line-clamp-4">
                                        {comment.comment || "Automated analysis output generated."}
                                    </p>
                                    <span className="text-xs text-gray-400 block mt-2">
                                        {new Date(comment.created_at).toLocaleString()}
                                    </span>
                                </div>
                                
                                <Button 
                                    onClick={() => handleViewCommentAssets(comment)}
                                    variant="outline" 
                                    className="mt-5 w-full gap-2 border-sky-100 text-sky-600 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200"
                                >
                                    <Eye className="h-4 w-4" />
                                    View Visuals & Code
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
                        <p className="text-gray-400">No detailed analysis comments generated yet.</p>
                    </div>
                )}
            </div>

            {/* --- Assets Viewer Dialog --- */}
            <Dialog open={!!selectedComment} onOpenChange={(open) => !open && setSelectedComment(null)}>
                <DialogContent className="max-w-6xl h-[85vh] flex flex-col bg-gray-50/50">
                    <DialogHeader className="px-1">
                        <DialogTitle className="text-xl text-gray-800 flex items-center gap-2">
                            <span>Analysis Visuals</span>
                            {loadingAssets && <Loader2 className="h-4 w-4 animate-spin text-sky-500" />}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar mt-2">
                        {loadingAssets ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                                <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
                                <p>Fetching charts and code...</p>
                            </div>
                        ) : commentAssets.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                                {/* Flatten assets logic:
                                    A comment has multiple assets.
                                    Each asset has an array of image_urls.
                                    We map over all of them to create individual cards.
                                */}
                                {commentAssets.flatMap((asset) => 
                                    asset.image_urls && asset.image_urls.length > 0 
                                    ? asset.image_urls.map((url, index) => (
                                        <AssetCard 
                                            key={`${asset._id}-${index}`} 
                                            imageUrl={url} 
                                            code={asset.code} 
                                        />
                                    ))
                                    : (
                                        // Fallback if an asset has code but no images (e.g. data printout)
                                        <div key={asset._id} className="bg-white border p-4 rounded-xl flex items-center justify-center min-h-[200px] text-gray-400 flex-col gap-2">
                                            <span>No image generated</span>
                                            <Button variant="outline" size="sm" onClick={() => {/* logic to show code only */}}>
                                                View Code
                                            </Button>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-dashed">
                                <p>No visual assets found for this step.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default ReportDetails;