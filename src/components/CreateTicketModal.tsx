import { useState } from 'react'
import { X } from 'lucide-react'
import { createTicket } from '../services/create-ticket'
import { useStore } from '../store'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function CreateTicketModal({
  isOpen,
  onClose,
}: Props) {

  const { addToast } = useStore()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    customer_name: '',
    company: '',
    city: '',
    complaint: '',
  })

  if (!isOpen) return null

  const handleSubmit = async () => {

    try {

      setLoading(true)

      await createTicket({
        customer_name: form.customer_name,
        company: form.company,
        city: form.city,

        complaint_verbatim: form.complaint,
        complaint_summary: form.complaint,

        complaint_type: 'General Complaint',
        severity: 'Medium',
      })

      

      addToast({
        type: 'success',
        title: 'Ticket created',
        description: 'New operational ticket created',
      })

      onClose()

    } catch (error) {

      console.error(error)

      addToast({
        type: 'error',
        title: 'Creation failed',
        description: 'Could not create ticket',
      })
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

      <div className="w-[500px] rounded-2xl p-6 border"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-secondary)'
        }}
      >

        <div className="flex items-center justify-between mb-5">

          <h2
            className="text-xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Create Ticket
          </h2>

          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>

        </div>

        <div className="space-y-4">

          <input
            placeholder="Customer Name"
            value={form.customer_name}
            onChange={(e) =>
              setForm({
                ...form,
                customer_name: e.target.value
              })
            }
            className="w-full p-3 rounded-xl bg-transparent border"
          />

          <input
            placeholder="Company"
            value={form.company}
            onChange={(e) =>
              setForm({
                ...form,
                company: e.target.value
              })
            }
            className="w-full p-3 rounded-xl bg-transparent border"
          />

          <input
            placeholder="City"
            value={form.city}
            onChange={(e) =>
              setForm({
                ...form,
                city: e.target.value
              })
            }
            className="w-full p-3 rounded-xl bg-transparent border"
          />

          <textarea
            placeholder="Describe complaint..."
            value={form.complaint}
            onChange={(e) =>
              setForm({
                ...form,
                complaint: e.target.value
              })
            }
            className="w-full p-3 rounded-xl bg-transparent border h-32"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full p-3 rounded-xl bg-indigo-500 text-white font-medium"
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>

        </div>
      </div>
    </div>
  )
}