import { useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

// resetKey badalne par captcha naya ban jata hai (token ek hi baar chalta hai)
export default function Captcha({ onToken, resetKey = 0 }) {
  const [status, setStatus] = useState('Captcha load ho raha hai...')

  if (!siteKey) {
    return (
      <p className="text-[15px] text-red-600">
        Captcha ki key nahi mili. VITE_TURNSTILE_SITE_KEY check karein.
      </p>
    )
  }

  return (
    <div>
      <Turnstile
        key={resetKey}
        siteKey={siteKey}
        onWidgetLoad={() => setStatus('Captcha load ho gaya, check chal raha hai...')}
        onSuccess={(token) => {
          setStatus('✅ Captcha pass ho gaya')
          onToken(token)
        }}
        onExpire={() => {
          setStatus('Captcha expire ho gaya, dobara karein')
          onToken(null)
        }}
        onError={(code) => {
          setStatus('❌ Captcha error: ' + (code || 'unknown'))
          onToken(null)
        }}
        onUnsupported={() => setStatus('❌ Ye browser captcha support nahi karta')}
        options={{ theme: 'light' }}
      />
      <p className="mt-2 text-[14px] text-muted">{status}</p>
    </div>
  )
}