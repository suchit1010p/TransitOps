const statusMap = {
  'Available': 'badge-available',
  'On Trip': 'badge-on-trip',
  'In Shop': 'badge-in-shop',
  'Retired': 'badge-retired',
  'Suspended': 'badge-suspended',
  'Off Duty': 'badge-off-duty',
  'Draft': 'badge-draft',
  'Dispatched': 'badge-dispatched',
  'Completed': 'badge-completed',
  'Cancelled': 'badge-cancelled',
  'Active': 'badge-active',
}

export default function StatusBadge({ status }) {
  const cls = statusMap[status] || 'badge-draft'
  return <span className={`badge ${cls}`}>{status}</span>
}
