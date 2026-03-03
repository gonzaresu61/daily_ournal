'use client'

export function BackgroundBlobs() {
  return (
    <>
      <div
        className="bg-blob animate-blob-1"
        style={{
          width: 520,
          height: 520,
          background: 'radial-gradient(circle, #3b6fe8 0%, #0a2a7a 100%)',
          top: -160,
          left: -100,
        }}
      />
      <div
        className="bg-blob animate-blob-2"
        style={{
          width: 380,
          height: 380,
          background: 'radial-gradient(circle, #8e44e8 0%, #3a0a6e 100%)',
          bottom: 60,
          right: -80,
        }}
      />
      <div
        className="bg-blob animate-blob-3"
        style={{
          width: 260,
          height: 260,
          background: 'radial-gradient(circle, #0099ff 0%, #004466 100%)',
          top: '50%',
          left: '50%',
        }}
      />
    </>
  )
}
