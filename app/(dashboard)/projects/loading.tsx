export default function ProjectsLoading() {
  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <div className='h-8 w-32 bg-white/5 rounded animate-pulse' />
          <div className='h-4 w-48 bg-white/5 rounded animate-pulse mt-2' />
        </div>
        <div className='h-10 w-32 bg-white/5 rounded animate-pulse' />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='rounded-xl border border-white/10 bg-[#141414] h-[200px] animate-pulse'
          />
        ))}
      </div>
    </div>
  );
}
