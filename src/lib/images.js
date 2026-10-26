import { supabase } from './supabase'

const BUCKET = 'product-images'
const MAX_INPUT = 8 * 1024 * 1024 // 8 MB
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Photo ka public link
export function productImageUrl(path) {
  if (!path) return ''
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// File chunte hi jaanch: kuch galat ho to message, sahi ho to ''
export function validateImage(file) {
  if (!TYPES.includes(file.type)) return 'Sirf JPG, PNG ya WebP photo chalegi'
  if (file.size > MAX_INPUT) return 'Photo 8 MB se chhoti honi chahiye'
  return ''
}

// Badi photo ko chhota karke JPEG banata hai
async function resizeImage(file, maxSize = 900, quality = 0.82) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff' // PNG ka transparent hissa safed ho jaye
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(bitmap, 0, 0, w, h)
  if (bitmap.close) bitmap.close()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!blob) throw new Error('Photo process nahi ho paayi')
  return blob
}

// Upload: dukaan ke folder mein. Milta hai { path } ya { error }
export async function uploadProductImage(shopId, file) {
  const problem = validateImage(file)
  if (problem) return { error: problem }

  try {
    const blob = await resizeImage(file)
    const path = `${shopId}/${crypto.randomUUID()}.jpg`
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: 'image/jpeg',
      cacheControl: '31536000',
    })
    if (error) return { error: 'Photo upload nahi hui: ' + error.message }
    return { path }
  } catch (e) {
    return { error: e.message || 'Photo upload nahi ho paayi' }
  }
}

export async function deleteProductImage(path) {
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}