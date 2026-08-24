import { useCallback, useState } from 'react'
import type { AddToQueueOptions, CustomerType, Department, QueueEntry } from '../types/queue'

export interface UseTransactionFormsOptions {
  addToQueue: (name: string, sid: string, svc: string, docType: string | null, opts?: AddToQueueOptions) => QueueEntry
  notify: (msg: string, type?: string) => void
}

export function useTransactionForms({ addToQueue, notify: showNotif }: UseTransactionFormsOptions) {
  const [reqName, setReqName] = useState('')
  const [reqDocType, setReqDocType] = useState('')
  const [reqPurpose, setReqPurpose] = useState('')
  const [reqCopies, setReqCopies] = useState(1)
  const [claimName, setClaimName] = useState('')
  const [claimDocType, setClaimDocType] = useState('')
  const [inquiryName, setInquiryName] = useState('')
  const [inquiryMsg, setInquiryMsg] = useState('')
  const [directName, setDirectName] = useState('')
  const [directSid, setDirectSid] = useState('')
  const [directCustomerType, setDirectCustomerType] = useState<CustomerType>('walk-in')
  const [lastQueueEntry, setLastQueueEntry] = useState<QueueEntry | null>(null)

  const handleDocRequest = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!reqName || !reqDocType) { showNotif('Please fill all required fields.', 'info'); return }
    const entry = addToQueue(reqName, '', 'document-request', reqDocType)
    setLastQueueEntry(entry)
    setReqName(''); setReqDocType(''); setReqPurpose(''); setReqCopies(1)
    showNotif(`Queue #${entry.number} assigned!`, 'success')
  }, [reqName, reqDocType, addToQueue, showNotif])

  const handleClaim = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!claimName) { showNotif('Please fill in your name.', 'info'); return }
    const entry = addToQueue(claimName, '', 'claim-document', claimDocType || null)
    setLastQueueEntry(entry)
    setClaimName(''); setClaimDocType('')
    showNotif(`Queue #${entry.number} assigned!`, 'success')
  }, [claimName, claimDocType, addToQueue, showNotif])

  const handleInquiry = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!inquiryName || !inquiryMsg) { showNotif('Please fill all fields.', 'info'); return }
    const entry = addToQueue(inquiryName, '', 'inquiry', null)
    setLastQueueEntry(entry)
    setInquiryName(''); setInquiryMsg('')
    showNotif(`Queue #${entry.number} assigned!`, 'success')
  }, [inquiryName, inquiryMsg, addToQueue, showNotif])

  const handleDirectQueue = useCallback((e: React.FormEvent, department: Department) => {
    e.preventDefault()
    if (!directName) { showNotif('Please fill in your name.', 'info'); return }
    const entry = addToQueue(directName, directSid, department, null, {
      department,
      customerType: directCustomerType,
      source: 'kiosk',
    })
    setLastQueueEntry(entry)
    setDirectName(''); setDirectSid(''); setDirectCustomerType('walk-in')
    showNotif(`Queue #${entry.number} assigned!`, 'success')
  }, [directName, directSid, directCustomerType, addToQueue, showNotif])

  return {
    reqName,
    setReqName,
    reqDocType,
    setReqDocType,
    reqPurpose,
    setReqPurpose,
    reqCopies,
    setReqCopies,
    claimName,
    setClaimName,
    claimDocType,
    setClaimDocType,
    inquiryName,
    setInquiryName,
    inquiryMsg,
    setInquiryMsg,
    directName,
    setDirectName,
    directSid,
    setDirectSid,
    directCustomerType,
    setDirectCustomerType,
    lastQueueEntry,
    setLastQueueEntry,
    handleDocRequest,
    handleClaim,
    handleInquiry,
    handleDirectQueue,
  }
}
