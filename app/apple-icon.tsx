import { ImageResponse } from 'next/og'

// Same mark as app/icon.svg, rendered as PNG for iOS home screens
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 18, background: '#22c55e', marginBottom: 12 }} />
        <div style={{ width: 34, height: 74, borderRadius: 9, background: '#ffffff' }} />
      </div>
    ),
    size
  )
}
