import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { EASE_SPIRITUAL } from '../../../constants/motion';

export default function HistoryList({
  history = [],
  onDeleteSession,
  onClearHistory,
  onCopyHistory,
}) {
  const totalCountAll = history.reduce(
    (acc, curr) => acc + (curr.count || 0),
    0
  );

  return (
    <aside
      className='w-full p-5 sm:p-6 rounded-3xl bg-bg-card/90 backdrop-blur-md border border-border-theme shadow-xs flex flex-col gap-4'
      role='complementary'
      aria-label='سجل جلسات التسبيح المحفوظة'>
      {/* Header */}
      <div className='flex items-center justify-between gap-2 pb-3 border-b border-border-theme/60'>
        <div className='flex items-center gap-2'>
          <span className='w-7 h-7 rounded-xl bg-gold/15 text-gold flex items-center justify-center text-xs'>
            <i className='fas fa-clock-rotate-left'></i>
          </span>
          <div>
            <h3 className='text-sm font-bold text-text-main'>
              سجل الجلسات المحفوظة
            </h3>
            <span className='text-[10px] text-text-muted'>
              (آخر {history.length} جلسات)
            </span>
          </div>
        </div>

        {history.length > 0 && (
          <div className='flex items-center gap-1.5'>
            <button
              type='button'
              onClick={onCopyHistory}
              className='p-1.5 rounded-lg bg-bg-elevated hover:bg-gold/20 text-text-muted hover:text-text-main transition text-xs cursor-pointer'
              title='نسخ ملخص الجلسات'
              aria-label='نسخ ملخص الجلسات'>
              <i className='fas fa-copy'></i>
            </button>
            <button
              type='button'
              onClick={onClearHistory}
              className='p-1.5 rounded-lg bg-bg-elevated hover:bg-rose-500/20 text-rose-500/80 hover:text-rose-500 transition text-xs cursor-pointer'
              title='مسح السجل بالكامل'
              aria-label='مسح السجل بالكامل'>
              <i className='fas fa-trash-can'></i>
            </button>
          </div>
        )}
      </div>

      {/* Summary stat badge if sessions exist */}
      {history.length > 0 && (
        <div className='flex items-center justify-between p-3 rounded-2xl bg-primary/10 border border-primary/20 text-xs'>
          <span className='text-text-main font-medium'>
            إجمالي التسبيحات المسجلة:
          </span>
          <span className='font-mono font-extrabold text-primary text-sm'>
            {totalCountAll} تسبيحة
          </span>
        </div>
      )}

      {/* Sessions List */}
      <div className='flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar'>
        {history.length === 0 ? (
          <div className='text-center py-10 px-4 text-text-muted text-xs bg-bg-elevated/40 rounded-2xl border border-dashed border-border-theme/70 flex flex-col items-center justify-center gap-2'>
            <Fingerprint className='w-7 h-7 text-gold/45' />
            <p className='font-medium text-text-main text-xs'>
              لا توجد جلسات محفوظة حالياً
            </p>
            <p className='text-[11px] text-text-muted'>
              اضغط على زر "حفظ الجلسة" بعد إتمام وردك ليُسجَّل هنا تلقائياً
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map((item, idx) => (
              <motion.div
                key={`${item.date}-${item.time}-${item.dhikr}-${idx}`}
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -24, height: 0 }}
                transition={{ duration: 0.25, ease: EASE_SPIRITUAL }}
                className='group flex items-center justify-between p-3 rounded-2xl bg-bg-elevated/60 hover:bg-bg-elevated border border-border-theme/70 hover:border-gold/30 transition-colors text-xs'>
                <div className='flex flex-col gap-0.5 text-right'>
                  <span className='font-bold text-text-main text-xs sm:text-sm'>
                    {item.dhikr}
                  </span>
                  <span className='text-text-muted text-[10px] flex items-center gap-1 font-mono'>
                    <i className='far fa-clock text-[9px] text-gold/70'></i>
                    <span>{item.date}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </span>
                </div>

                <div className='flex items-center gap-2.5'>
                  <span className='font-mono font-extrabold text-gold px-2.5 py-1 rounded-xl bg-gold/15 border border-gold/20 text-xs'>
                    {item.count}×
                  </span>
                  {onDeleteSession && (
                    <button
                      type='button'
                      onClick={() => onDeleteSession(idx)}
                      className='opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-rose-500 transition cursor-pointer'
                      title='حذف هذه الجلسة'
                      aria-label='حذف هذه الجلسة'>
                      <i className='fas fa-xmark text-xs'></i>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
}
