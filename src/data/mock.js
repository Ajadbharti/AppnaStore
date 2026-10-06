export const initialOrders = [
  { id: 'AS-1042', status: 'new', when: 'Today, 9:12 AM', customer: 'Rohit Sharma', area: 'Kothrud', items: 'Atta 5 kg ×1, Milk 500 ml ×4', phone: '98200 11223', amount: 405 },
  { id: 'AS-1041', status: 'new', when: 'Today, 8:40 AM', customer: 'Meena Iyer', area: 'Paudh Road', items: 'Toor Dal 1 kg ×2, Oil 1 L ×1', phone: '99870 44556', amount: 475 },
  { id: 'AS-1040', status: 'accepted', when: 'Today, 8:05 AM', customer: 'Arjun Patil', area: 'Karvenagar', items: 'Tomatoes 500 g ×2, Detergent 1 kg ×1', phone: '90040 77889', amount: 190 },
  { id: 'AS-1039', status: 'delivered', when: 'Yesterday, 7:20 PM', customer: 'Sana Shaikh', area: 'Warje', items: 'Milk 500 ml ×6', phone: '98333 20011', amount: 180 },
]

export const initialProducts = [
  { id: 1, name: 'Aashirvaad Atta', category: 'Staples', unit: '5 kg', price: 285, stock: 24, inStock: true },
  { id: 2, name: 'Amul Taaza Milk', category: 'Dairy', unit: '500 ml', price: 30, stock: 40, inStock: true },
  { id: 3, name: 'Fortune Sunflower Oil', category: 'Kirana', unit: '1 L', price: 155, stock: 0, inStock: false },
]

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const weekSales = [3400, 4000, 3100, 5400, 6000, 8000, 4900]
export const totalEarnings = 1250