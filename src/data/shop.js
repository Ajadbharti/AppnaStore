const KEY = 'apnastore_shop'

const defaults = {
  shopName: 'Meri Dukaan',
  ownerName: 'Dukandar',
  mobile: '',
  email: '',
  area: '',
  city: '',
  radius: 3,
  openTime: '08:00',
  closeTime: '22:00',
  categories: ['Kirana'],
  gst: '',
  upi: '',
}

export function loadShop() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return defaults
  }
}

export function saveShop(shop) {
  try {
    localStorage.setItem(KEY, JSON.stringify(shop))
  } catch {
    /* ignore */
  }
}