import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import { documentApi } from '../../api/documentApi';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { BASE_URL } from '../../api/axios';
import { formatDate } from '../../utils/formatters';

export const MyDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await documentApi.getMyDocuments();
        setDocuments(Array.isArray(res) ? res : res.content || []);
      } catch (err) {
        console.error('Failed to load my documents:', err);
        toast.error('Failed to fetch personal documents repository.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [toast]);

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (doc) => {
    setDownloadingId(doc.id);
    try {
      await documentApi.downloadDocument(doc.id, doc.fileName);
      toast.success('Document downloaded successfully!');
    } catch (err) {
      console.error('Failed to download document:', err);
      toast.error('Failed to download document.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Official Documents & Certificates
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Access and download your verified workplace agreements, identity files, and letters.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading document vault...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <EmptyState
            icon={FolderOpen}
            title="No documents uploaded yet"
            description="Your HR manager will upload your official offer letters, contracts, and certificates here."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 uppercase">
                    {doc.documentType?.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={doc.fileName}>
                  {doc.fileName}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Added {formatDate(doc.createdAt)}</span>
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  disabled={downloadingId === doc.id}
                  className="w-full py-2.5 px-3 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className={`w-3.5 h-3.5 ${downloadingId === doc.id ? 'animate-bounce' : ''}`} />
                  <span>{downloadingId === doc.id ? 'Downloading...' : 'Download Document'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
