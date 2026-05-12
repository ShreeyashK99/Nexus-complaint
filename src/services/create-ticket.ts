import { supabase } from '../lib/supabase'

export async function createTicket(ticket: any) {

  const { data, error } = await supabase
    .from('tickets')
    .insert([
      {
        customer_name: ticket.customer_name || 'Customer',
        company: ticket.company || '',
        city: ticket.city || '',
        segment: ticket.segment || '',
        product: ticket.product || '',
        order_reference: '',

        complaint_verbatim: ticket.complaint_verbatim || '',
        complaint_summary: ticket.complaint_summary || '',

        complaint_type: ticket.complaint_type || 'General Complaint',
        severity: ticket.severity || 'P3',

        desired_outcome: '',
        key_account: false,

        status: 'Open',

        alignment_call_done: false,

        root_cause: '',
        preventive_action: '',

        customer_satisfaction: null,
      },
    ])
    .select()

  if (error) {
    console.error('SUPABASE ERROR:', error)
    throw error
  }

  return data[0]
}