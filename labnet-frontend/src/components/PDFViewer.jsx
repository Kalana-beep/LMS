import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

const PDFViewer = ({ documentId, title, onClose }) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const response = await api.get(`/documents/view/${documentId}`, {
          responseType: 'blob'
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('PDF fetch error:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchPDF();

    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [documentId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 p-2">
          {loading && <div className="text-center py-20">Loading PDF...</div>}
          {error && <div className="text-center py-20 text-red-400">Failed to load PDF. Please try again.</div>}
          {pdfBlobUrl && !error && (
            <iframe src={pdfBlobUrl} className="w-full h-full rounded-lg" title={title} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;