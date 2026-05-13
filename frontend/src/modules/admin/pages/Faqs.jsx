import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, 
  HelpCircle, Search, Save, X,
  ArrowUpDown, Loader2, Info
} from "lucide-react";
import { PageHeader } from '../components/common/PageHeader';
import { Modal } from '../components/common/Modal';
import { Button } from "@/components/ui/button";
import { Toast } from '../components/common/Toast';
import { faqApi } from '@/lib/api';

const Faqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Form states
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [order, setOrder] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await faqApi.getAll();
      if (res.success) {
        setFaqs(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load FAQs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaq = () => {
    setEditingFaq(null);
    setQuestion("");
    setAnswer("");
    setOrder(faqs.length + 1);
    setIsModalOpen(true);
  };

  const handleEditFaq = (faq) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setOrder(faq.order || 0);
    setIsModalOpen(true);
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ? It will be removed instantly.')) return;
    try {
      await faqApi.delete(id);
      setFaqs(prev => prev.filter(item => item._id !== id));
      showToast('FAQ deleted successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete FAQ', 'error');
    }
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      showToast('Please fill out all fields', 'error');
      return;
    }

    const targetOrder = Number(order) || 1;

    const payload = {
      question: question.trim(),
      answer: answer.trim(),
      order: targetOrder
    };

    try {
      if (editingFaq) {
        // Edit flow
        await faqApi.update(editingFaq._id, payload);
        showToast('FAQ updated successfully', 'success');
      } else {
        // Create flow
        await faqApi.create(payload);
        showToast('FAQ created successfully', 'success');
      }
      setIsModalOpen(false);
      await fetchFaqs();
    } catch (err) {
      showToast(err.message || err || 'Failed to save FAQ', 'error');
    }
  };

  // Filter and sort FAQs
  const filteredFaqs = faqs
    .filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="FAQ Support Manager" 
        subtitle="Manage frequently asked questions rendered dynamically inside the User Support Center"
        actions={
          <Button 
            onClick={handleAddFaq}
            className="bg-primary hover:bg-primary/90 text-zinc-900 font-black text-xs uppercase tracking-widest h-11 px-5 rounded-xl shadow-lg shadow-primary/10 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add New Question
          </Button>
        }
      />

      {/* Stats & Banner Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
             <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
             <span className="text-xl font-black text-zinc-900 dark:text-white leading-none">{faqs.length}</span>
             <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-1.5">Total Questions</span>
          </div>
        </div>

        <div className="admin-card p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 rounded-2xl flex items-center gap-4 col-span-2">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 rounded-xl shrink-0">
             <Info className="w-5 h-5" />
          </div>
          <p className="text-[10px] text-zinc-400 font-extrabold uppercase leading-normal tracking-wide">
            PRO-TIP: All FAQ entries configured below will dynamically reflect instantly inside the user-facing mobile Support Center page. Use logical and clear answers.
          </p>
        </div>
      </div>

      {/* Control & Filter Strip */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search FAQs by keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary placeholder:text-zinc-400"
            />
         </div>
      </div>

      {/* Loading & Grid view */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
           <span className="text-xs font-black text-zinc-400 uppercase tracking-widest animate-pulse">Synchronizing FAQs...</span>
        </div>
      ) : filteredFaqs.length > 0 ? (
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <motion.div 
              key={faq._id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="admin-card p-6 border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-[#0c0c0e] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative group"
            >
               <div className="space-y-1.5 flex-1 pr-6">
                  <div className="flex items-center gap-2.5">
                     <span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md tracking-wider">ORDER: {faq.order}</span>
                     <span className="text-[9px] font-bold text-zinc-400 uppercase">UID: {faq._id?.slice(-6).toUpperCase()}</span>
                  </div>
                  <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white leading-snug tracking-tight">{faq.question}</h4>
                  <p className="text-[11px] text-zinc-400 font-semibold uppercase leading-relaxed tracking-tight">{faq.answer}</p>
               </div>

               <div className="flex items-center gap-2 shrink-0 md:self-center">
                  <Button 
                    onClick={() => handleEditFaq(faq)}
                    variant="ghost" 
                    size="icon" 
                    className="w-9 h-9 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 hover:text-zinc-950 text-zinc-400 dark:text-zinc-500"
                  >
                     <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={() => handleDeleteFaq(faq._id)}
                    variant="ghost" 
                    size="icon" 
                    className="w-9 h-9 rounded-xl border border-red-100 dark:border-red-950/50 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 text-rose-500"
                  >
                     <Trash2 className="w-4 h-4" />
                  </Button>
               </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="admin-card p-24 text-center flex flex-col items-center justify-center gap-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-transparent">
           <HelpCircle className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
           <div className="space-y-1">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider leading-none">No FAQs Found</h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest max-w-[300px] mt-2 leading-relaxed">No frequently asked questions match your criteria or none have been added yet.</p>
           </div>
           <Button onClick={handleAddFaq} className="bg-primary hover:bg-primary/90 text-zinc-900 font-black text-[10px] uppercase tracking-widest h-10 px-5 rounded-xl mt-2">Create First FAQ</Button>
        </div>
      )}

      {/* Modal for Create/Update FAQ */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingFaq ? "Update FAQ Entry" : "Create FAQ Entry"}
      >
        <form onSubmit={handleSaveFaq} className="space-y-6 py-2">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block px-1">Question / Inquiry Title</label>
            <input 
              type="text"
              required
              placeholder="e.g. How do I track my delivery vehicle?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full h-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block px-1">Answer / Response Details</label>
            <textarea 
              required
              rows={4}
              placeholder="e.g. Go to the 'Requests' tab and click on your active order to view live map tracking details..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-primary resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block px-1">Order Priority (Sorting)</label>
            <div className="relative">
              <input 
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full h-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-xs font-black text-primary focus:outline-none focus:border-primary"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-400 uppercase">Sort Order</span>
            </div>
            <p className="text-[8px] text-zinc-400 font-bold uppercase block px-1 leading-normal">Lower order numbers are placed at the top of the user FAQ list.</p>
          </div>

          <div className="flex gap-3 pt-3">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-zinc-900 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/15"
            >
              <Save className="w-3.5 h-3.5 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast notifications */}
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ show: false, message: '', type: 'success' })} 
      />
    </div>
  );
};

export default Faqs;
