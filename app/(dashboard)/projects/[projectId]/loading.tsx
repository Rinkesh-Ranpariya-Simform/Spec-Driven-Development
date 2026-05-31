export default function ProjectLoading() {
  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div className='h-6 w-64 bg-white/5 rounded animate-pulse' />
        <div className='flex gap-2'>
          <div className='h-10 w-28 bg-white/5 rounded animate-pulse' />
          <div className='h-10 w-32 bg-white/5 rounded animate-pulse' />
        </div>
      </div>
      <div className='flex gap-4 overflow-x-auto pb-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex-shrink-0 w-[280px]'>
            <div className='h-6 w-20 bg-white/5 rounded animate-pulse mb-3' />
            <div className='h-0.5 bg-white/5 rounded mb-3' />
            <div className='space-y-2'>
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className='h-20 bg-white/5 rounded-lg animate-pulse'
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
