'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  ReceiptIndianRupee, 
  IndianRupee, 
  Calendar, 
  Tag, 
  FileText, 
  AlertCircle,
  Plus,
  Camera,
  Trash2,
  MapPin,
  CheckCircle2,
  Clock,
  Edit3,
  Video,
  Play
} from 'lucide-react';
import { ExpenseCategory, CommitteeSettings, AuthUser, ExpenseRecord, WorkStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { getWorkVideoContentType, isVideoMedia, MAX_WORK_VIDEO_BYTES } from '@/lib/workMedia';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminPin: string;
  settings: CommitteeSettings | null;
  onExpenseAdded: () => void;
  currentUser?: AuthUser | null;
  expenseToEdit?: ExpenseRecord | null;
}

interface PendingVideo {
  id: string;
  file: File;
  previewUrl: string;
}

// Client-side image compressor: downscales large phone camera photos to crisp ~60-90KB JPEG
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 900;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  adminPin,
  settings,
  onExpenseAdded,
  currentUser,
  expenseToEdit
}) => {
  const { isHindi } = useLanguage();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = Boolean(expenseToEdit);
  const isAdminTier = currentUser?.role === 'ADMIN' || currentUser?.role === 'CO_ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const effectivePin = adminPin || (isAdminTier && currentUser?.pin ? currentUser.pin : '');

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('COMMUNITY_WELFARE');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptNote, setExpenseReceiptNote] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [pendingVideos, setPendingVideos] = useState<PendingVideo[]>([]);
  const [status, setStatus] = useState<WorkStatus>('COMPLETED');
  const [location, setLocation] = useState('');
  const [pinInput, setPinInput] = useState(effectivePin);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount.toString());
      setDate(expenseToEdit.date);
      setExpenseReceiptNote(expenseToEdit.receiptNote || '');
      setDescription(expenseToEdit.description || '');
      setImages(expenseToEdit.images || []);
      setStatus(expenseToEdit.status || 'COMPLETED');
      setLocation(expenseToEdit.location || '');
    } else {
      setTitle('');
      setCategory('COMMUNITY_WELFARE');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setExpenseReceiptNote('');
      setDescription('');
      setImages([]);
      setStatus('COMPLETED');
      setLocation('');
    }
  }, [expenseToEdit, isOpen]);

  const closeModal = useCallback(() => {
    setPendingVideos(previous => {
      previous.forEach(video => URL.revokeObjectURL(video.previewUrl));
      return [];
    });
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (adminPin) {
      setPinInput(adminPin);
    } else if (isAdminTier && currentUser?.pin) {
      setPinInput(currentUser.pin);
    }
  }, [adminPin, currentUser, isAdminTier]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsProcessingImages(true);
    setErrorMessage(null);
    try {
      const remainingSlots = Math.max(0, 10 - images.length - pendingVideos.length);
      const files = Array.from(e.target.files).slice(0, remainingSlots);
      const photoFiles = files.filter(file => file.type.startsWith('image/'));
      const videoFiles = files.filter(file => Boolean(getWorkVideoContentType(file.type, file.name)));
      const unsupportedFiles = files.filter(file => !file.type.startsWith('image/') && !getWorkVideoContentType(file.type, file.name));
      const oversizedVideo = videoFiles.find(file => file.size > MAX_WORK_VIDEO_BYTES);

      if (unsupportedFiles.length > 0) throw new Error('UNSUPPORTED_MEDIA');
      if (oversizedVideo) throw new Error('VIDEO_TOO_LARGE');

      const compressedList = await Promise.all(photoFiles.map(compressImage));
      const nextImages = [...images, ...compressedList];
      const encodedBytes = nextImages.reduce((total, image) => total + image.length, 0);
      if (encodedBytes > 3_500_000) {
        throw new Error('PHOTO_PAYLOAD_TOO_LARGE');
      }
      setImages(nextImages);
      setPendingVideos(previous => [
        ...previous,
        ...videoFiles.map(file => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          previewUrl: URL.createObjectURL(file)
        }))
      ]);
    } catch (err) {
      console.error('Failed to prepare work media:', err);
      setErrorMessage(
        err instanceof Error && err.message === 'VIDEO_TOO_LARGE'
          ? (isHindi ? 'हर वीडियो 50 MB या उससे छोटा होना चाहिए।' : 'Each video must be 50 MB or smaller.')
          : err instanceof Error && err.message === 'UNSUPPORTED_MEDIA'
            ? (isHindi ? 'केवल फोटो, MP4, MOV, M4V या WebM वीडियो जोड़ें।' : 'Please add only photos or MP4, MOV, M4V, or WebM videos.')
            : err instanceof Error && err.message === 'PHOTO_PAYLOAD_TOO_LARGE'
              ? (isHindi ? 'तस्वीरें बहुत बड़ी हैं। कृपया कम तस्वीरें चुनें।' : 'The selected photos are too large. Please choose fewer photos.')
              : (isHindi ? 'मीडिया प्रोसेस करने में त्रुटि हुई।' : 'Failed to process selected media.')
      );
    } finally {
      setIsProcessingImages(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemovePendingVideo = (id: string) => {
    setPendingVideos(previous => previous.filter(video => {
      if (video.id === id) URL.revokeObjectURL(video.previewUrl);
      return video.id !== id;
    }));
  };

  const uploadVideo = async (video: PendingVideo): Promise<string> => {
    const contentType = getWorkVideoContentType(video.file.type, video.file.name);
    if (!contentType) throw new Error(isHindi ? 'वीडियो प्रकार समर्थित नहीं है।' : 'Unsupported video type.');
    const initializeResponse = await fetch('/api/work-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: video.file.name,
        contentType,
        size: video.file.size
      })
    });
    const uploadDetails = await initializeResponse.json();
    if (!initializeResponse.ok) {
      throw new Error(uploadDetails.error || 'Could not prepare video upload.');
    }

    const formData = new FormData();
    formData.append('cacheControl', '31536000');
    const uploadFile = video.file.type
      ? video.file
      : new File([video.file], video.file.name, { type: contentType });
    formData.append('', uploadFile);
    const uploadResponse = await fetch(uploadDetails.signedUrl, {
      method: 'PUT',
      body: formData
    });
    if (!uploadResponse.ok) {
      throw new Error(isHindi ? 'वीडियो अपलोड नहीं हुआ। कृपया दोबारा कोशिश करें।' : 'Video upload failed. Please try again.');
    }
    return uploadDetails.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanTitle = title.trim();
    const cleanAmount = parseFloat(amount);
    const pinToUse = (pinInput || effectivePin).trim();

    if (!cleanTitle) {
      setErrorMessage(isHindi ? 'कृपया व्यय / कार्य का शीर्षक दर्ज करें।' : 'Please enter the expense / work title.');
      return;
    }

    if (!cleanAmount || cleanAmount <= 0) {
      setErrorMessage(isHindi ? 'कृपया मान्य व्यय राशि दर्ज करें।' : 'Please enter a valid expense amount.');
      return;
    }

    if (!pinToUse) {
      setErrorMessage(isHindi ? 'व्यवस्थापक पिन (Admin PIN) आवश्यक है।' : 'Admin PIN is required to log/edit expenses.');
      return;
    }

    setIsLoading(true);
    try {
      const uploadedVideos: string[] = [];
      for (const video of pendingVideos) {
        uploadedVideos.push(await uploadVideo(video));
      }

      const payload: any = {
        title: cleanTitle,
        category,
        amount: cleanAmount,
        date,
        description: description.trim(),
        receiptNote: receiptNote.trim(),
        adminPin: pinToUse,
        images: [...images, ...uploadedVideos],
        status,
        location: location.trim()
      };

      if (isEditMode && expenseToEdit) {
        payload.id = expenseToEdit.id;
        const res = await fetch('/api/expenses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update expense');
      } else {
        payload.recordedBy = currentUser?.name || settings?.adminName || 'Admin';
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to record expense');
      }

      confetti({ particleCount: 50, spread: 60 });
      pendingVideos.forEach(video => URL.revokeObjectURL(video.previewUrl));
      setPendingVideos([]);
      onExpenseAdded();

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 relative my-auto max-h-[92dvh] overflow-hidden">
        {/* Sticky Header with Prominent Close Button */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${isEditMode ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {isEditMode ? <Edit3 className="w-5 h-5" /> : <ReceiptIndianRupee className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                {isEditMode
                  ? (isHindi ? 'सार्वजनिक कार्य / व्यय संपादित करें' : 'Edit Public Work / Expense')
                  : (isHindi ? 'नया सार्वजनिक कार्य / व्यय दर्ज करें' : 'Log New Public Work / Expense')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {isHindi ? 'कार्य का विवरण, फोटो, वीडियो और पारदर्शी हिसाब' : 'Project details, work photos, videos and records'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 flex items-center justify-center transition cursor-pointer border border-slate-200 active:scale-95 shadow-2xs shrink-0"
            aria-label={isHindi ? 'बंद करें' : 'Close'}
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Work / Expense Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'कार्य / व्यय शीर्षक *' : 'Work / Expense Title *'}
              </label>
              <input
                ref={titleInputRef}
                type="text"
                placeholder={isHindi ? 'उदा. श्मशान घाट जीर्णोद्धार / स्ट्रीट लाइट' : 'e.g. Shamshan Ghat Renovation / Street Light'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'श्रेणी *' : 'Category *'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 font-medium"
                >
                  <option value="COMMUNITY_WELFARE">{isHindi ? 'सार्वजनिक कार्य / विकास' : 'Community Welfare'}</option>
                  <option value="EVENT">{isHindi ? 'बैठक एवं आयोजन' : 'Event & Meeting'}</option>
                  <option value="CHARITY">{isHindi ? 'दान एवं सहायता' : 'Charity & Donation'}</option>
                  <option value="DISBURSEMENT">{isHindi ? 'आवंटन / ऋण' : 'Member Loan / Disbursement'}</option>
                  <option value="ADMINISTRATIVE">{isHindi ? 'प्रशासन एवं पंजी' : 'Admin & Stationery'}</option>
                  <option value="MAINTENANCE">{isHindi ? 'मरम्मत एवं रखरखाव' : 'Maintenance'}</option>
                  <option value="OTHER">{isHindi ? 'अन्य कार्य' : 'Other'}</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'खर्च राशि (₹) *' : 'Amount (₹) *'}
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="1"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm font-black focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>
            </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'दिनांक *' : 'Date *'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            {/* Bill Voucher */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'बिल / वाउचर नं.' : 'Bill / Voucher No.'}
              </label>
              <input
                type="text"
                placeholder={isHindi ? 'उदा. बिल क्र. 441' : 'e.g. Bill #441'}
                value={receiptNote}
                onChange={(e) => setExpenseReceiptNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Work Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'कार्य स्थिति (Status)' : 'Work Status'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 font-medium"
              >
                <option value="COMPLETED">{isHindi ? '✅ कार्य पूर्ण (Completed)' : '✅ Completed'}</option>
                <option value="IN_PROGRESS">{isHindi ? '⏳ प्रगति पर (In Progress)' : '⏳ In Progress'}</option>
                <option value="PLANNED">{isHindi ? '📋 प्रस्तावित (Planned)' : '📋 Planned'}</option>
              </select>
            </div>

            {/* Location (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'कार्य स्थल (वैकल्पिक)' : 'Location (Optional)'}
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isHindi ? 'उदा. श्मशान घाट / वार्ड 2' : 'e.g. Ward 2'}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {isHindi ? 'विवरण (वैकल्पिक)' : 'Description (Optional)'}
            </label>
            <textarea
              rows={2}
              placeholder={isHindi ? 'सार्वजनिक कार्य या खर्च का विवरण...' : 'Expenditure details for transparency records...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          {/* Work Photos & Videos Upload Section */}
          <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>{isHindi ? 'कार्य की फोटो और वीडियो' : 'Work Photos & Videos'}</span>
                <span className="text-[10px] text-amber-700 font-normal">({images.length + pendingVideos.length}/10)</span>
              </label>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImages || images.length + pendingVideos.length >= 10}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isProcessingImages ? (isHindi ? 'प्रोसेसिंग...' : 'Processing...') : (isHindi ? 'फोटो / वीडियो जोड़ें' : 'Add Photos / Videos')}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm,video/quicktime,video/x-m4v"
                multiple
                className="hidden"
                onChange={handleMediaUpload}
              />
            </div>

            {/* Thumbnail Preview Grid */}
            {images.length + pendingVideos.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-amber-300 shadow-2xs bg-white">
                    {isVideoMedia(img) ? (
                      <>
                        <video src={img} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                        <Play className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white" />
                      </>
                    ) : (
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm cursor-pointer active:scale-90"
                      title={isHindi ? 'हटाएं' : 'Remove'}
                    >
                      <X className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                ))}
                {pendingVideos.map(video => (
                  <div key={video.id} className="relative group aspect-square rounded-xl overflow-hidden border border-amber-300 shadow-2xs bg-white">
                    <video src={video.previewUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                    <Video className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white" />
                    <button
                      type="button"
                      onClick={() => handleRemovePendingVideo(video.id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm cursor-pointer active:scale-90"
                      title={isHindi ? 'हटाएं' : 'Remove'}
                    >
                      <X className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-amber-800/80 leading-relaxed">
                {isHindi
                  ? '💡 कैमरे या गैलरी से फोटो और छोटे वीडियो जोड़ें। फोटो अपने-आप कंप्रेस होंगे; हर वीडियो अधिकतम 50 MB हो सकता है।'
                  : '💡 Add photos and short videos from your camera/gallery. Photos are compressed automatically; each video can be up to 50 MB.'}
              </p>
            )}
          </div>

          {/* Admin PIN (if not already authenticated) */}
          {!effectivePin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHindi ? 'व्यवस्थापक पिन (Admin PIN) *' : 'Admin PIN *'}
              </label>
              <input
                type="password"
                inputMode="numeric"
                placeholder="****"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs tracking-widest focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 font-bold"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isLoading || isProcessingImages}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/10 transition cursor-pointer disabled:opacity-50"
            >
              {isEditMode ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
              <span>
                {isLoading 
                  ? (pendingVideos.length > 0
                    ? (isHindi ? 'वीडियो अपलोड हो रहा है...' : 'Uploading video...')
                    : (isHindi ? 'सुरक्षित किया जा रहा है...' : 'Saving...'))
                  : isEditMode 
                    ? (isHindi ? 'परिवर्तन सुरक्षित करें' : 'Save Changes') 
                    : (isHindi ? 'सार्वजनिक कार्य दर्ज करें' : 'Record Public Work')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
};
