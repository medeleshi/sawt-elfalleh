'use client'

import { useState, useTransition } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AlertCircle, CheckCircle2, X, Send, ChevronRight } from 'lucide-react'
import { reportPostAction, reportUserAction } from '@/actions/reports.actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

interface Props {
  postId?: string
  reportedUserId?: string
  trigger?: React.ReactNode
}

export default function ReportModal({ postId, reportedUserId, trigger }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [isPending, startTransition] = useTransition()

  const POST_REASONS = [
    'إعلان كاذب أو مضلل',
    'سعر غير واقعي',
    'محتوى غير لائق',
    'إعلان مكرر',
    'تصنيف غير صحيح',
    'أخرى',
  ]

  const USER_REASONS = [
    'سلوك غير لائق',
    'محاولة احتيال',
    'انتحال شخصية',
    'إرسال رسائل مزعجة',
    'أخرى',
  ]

  const reasons = postId ? POST_REASONS : USER_REASONS

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset after a small delay to allow exit animation
      setTimeout(() => {
        setIsSubmitted(false)
        setSelectedReason('')
        setCustomReason('')
      }, 200)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Logic fix: prioritize selectedReason unless it's 'أخرى' or empty
    const finalReason = (selectedReason && selectedReason !== 'أخرى') 
      ? selectedReason 
      : customReason.trim()

    if (!finalReason || finalReason.length < 5) {
      toast.error('يرجى توضيح سبب البلاغ (5 أحرف على الأقل)')
      return
    }

    startTransition(async () => {
      let result
      if (postId) {
        result = await reportPostAction({ post_id: postId, reason: finalReason })
      } else if (reportedUserId) {
        result = await reportUserAction({ reported_user_id: reportedUserId, reason: finalReason })
      }

      if (result?.success) {
        setIsSubmitted(true)
      } else {
        toast.error(result?.error || 'حدث خطأ ما')
      }
    })
  }

  const isFormValid = (selectedReason && selectedReason !== 'أخرى') || customReason.trim().length >= 5

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        {trigger || (
          <button className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors">
            إبلاغ
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" />
        <Dialog.Content 
          className={cn(
            "fixed left-[50%] top-[50%] z-[101] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-0 outline-none",
            "animate-in fade-in zoom-in-95 duration-200"
          )}
          dir="rtl"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden mx-4">
            {isSubmitted ? (
              <div className="p-8 text-center bg-gradient-to-b from-emerald-50/50 to-white">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <CheckCircle2 size={40} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">شكراً لمساهمتك!</h3>
                <p className="text-slate-600 leading-relaxed mb-8 max-w-sm mx-auto">
                  لقد استلمنا بلاغك بنجاح. فريق الإدارة يقوم الآن بمراجعة المحتوى لضمان بيئة آمنة لجميع الفلاحين والتجار.
                </p>
                <button
                  onClick={() => handleOpenChange(false)}
                  className="w-full py-4 px-6 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                >
                  حسناً، فهمت
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-black text-slate-900">إرسال بلاغ</Dialog.Title>
                      <Dialog.Description className="text-xs text-slate-500 font-medium mt-0.5">
                        ساعدنا في الحفاظ على أمان المنصة
                      </Dialog.Description>
                    </div>
                  </div>
                  <Dialog.Close className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </Dialog.Close>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Reason Buttons */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      لماذا تود الإبلاغ عن هذا {postId ? 'المنشور' : 'المستخدم'}؟
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {reasons.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setSelectedReason(r)}
                          className={cn(
                            "px-4 py-3 rounded-xl text-sm font-bold border transition-all text-right flex items-center justify-between group",
                            selectedReason === r
                              ? "bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          {r}
                          {selectedReason === r && <CheckCircle2 size={16} className="text-red-500" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Text Area */}
                  <div className={cn(
                    "transition-all duration-300 overflow-hidden",
                    (selectedReason === 'أخرى' || !selectedReason) ? "max-h-48 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  )}>
                    <div className="pt-2">
                      <textarea
                        className={cn(
                          "w-full h-32 p-4 text-sm border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-400 outline-none transition-all resize-none shadow-sm placeholder:text-slate-300",
                          selectedReason === 'أخرى' && "border-red-200"
                        )}
                        placeholder={selectedReason === 'أخرى' ? "يرجى كتابة التفاصيل هنا..." : "أو اكتب سبباً مخصصاً مباشرة..."}
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        minLength={5}
                        maxLength={500}
                      />
                      <div className="mt-1.5 flex justify-between px-1">
                        <span className="text-[10px] text-slate-400 font-medium">أدخل 5 أحرف على الأقل</span>
                        <span className={cn(
                          "text-[10px] font-medium",
                          customReason.length > 450 ? "text-orange-500" : "text-slate-400"
                        )}>
                          {customReason.length}/500
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isPending || !isFormValid}
                      className={cn(
                        "flex-[2] py-4 px-6 text-white font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 group active:scale-[0.98]",
                        isFormValid 
                          ? "bg-red-600 hover:bg-red-700 shadow-red-100" 
                          : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                      )}
                    >
                      {isPending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          إرسال البلاغ
                          <Send size={18} className={cn("transition-transform", isFormValid && "group-hover:translate-x-[-4px]")} />
                        </>
                      )}
                    </button>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]"
                      >
                        إلغاء
                      </button>
                    </Dialog.Close>
                  </div>
                </form>

                {/* Footer Tip */}
                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                    بلاغاتك سرية وتساعدنا في جعل <span className="text-emerald-600 font-bold">صوت الفلاح</span> مكاناً آمناً للجميع.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
