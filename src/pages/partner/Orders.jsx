import OrderRow from '../../components/OrderRow'

export default function Orders({ orders, onStatus }) {
  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Orders</h1>

      {orders.length === 0 ? (
        <p className="card mt-8 p-10 text-center text-lg text-muted">
          Abhi koi order nahi aaya. Naye order yahan apne aap dikhenge.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-5">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} onStatus={onStatus} detailed />
          ))}
        </div>
      )}
    </div>
  )
}