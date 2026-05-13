import { supabase } from '../lib/supabase'

export async function createTicket(ticket: any) {
  

  let deadlineHours = 48;

if (ticket.severity === 'Low') {
  deadlineHours = 72;
}

if (ticket.severity === 'Medium') {
  deadlineHours = 48;
}

if (ticket.severity === 'High') {
  deadlineHours = 24;
}

if (ticket.severity === 'Critical') {
  deadlineHours = 4;
}

const slaDeadline = new Date(
  Date.now() + deadlineHours * 60 * 60 * 1000
).toISOString();

  
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



sla_deadline: slaDeadline,


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