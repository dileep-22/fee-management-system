import { useCallback } from 'react'
import toast from 'react-hot-toast'

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.id  = 'razorpay-script'
    script.src = RAZORPAY_SCRIPT
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Opens the real Razorpay checkout popup.
 *
 * @param {object} options
 *   orderData   - response from POST /fee-records/gateway/create-order
 *   studentName - shown in the checkout popup
 *   email       - pre-fills the email field
 *   phone       - pre-fills the contact field
 *   onSuccess   - called with { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *   onFailure   - called with error message string
 */
export function useRazorpay() {
  const openCheckout = useCallback(async ({
    orderData,
    studentName,
    email,
    phone,
    onSuccess,
    onFailure,
  }) => {
    const loaded = await loadRazorpayScript()
    if (!loaded) {
      toast.error('Could not load payment gateway. Check your internet connection.')
      onFailure?.('Script load failed')
      return
    }

    const options = {
      key:          orderData.keyId,          // rzp_test_SeiJ64XPy4DRE1
      amount:       Math.round(Number(orderData.amount) * 100),  // rupees → paise
      currency:     orderData.currency || 'INR',
      name:         'FeeManage Pro',
      description:  `Fee Payment`,
      image:        '/logo.png',              // optional: your logo
      order_id:     orderData.orderId,        // Razorpay order id from server

      prefill: {
        name:    studentName || '',
        email:   email       || '',
        contact: phone       || '',
      },

      theme: { color: '#2563eb' },

      // ── Handlers ────────────────────────────────────────────────────────────
      handler: function (response) {
        // Called by Razorpay on successful payment
        // response = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
        onSuccess?.(response)
      },

      modal: {
        ondismiss: function () {
          toast('Payment cancelled', { icon: 'ℹ️' })
          onFailure?.('Payment dismissed by user')
        },
      },
    }

    const rzp = new window.Razorpay(options)

    rzp.on('payment.failed', function (response) {
      const msg = response.error?.description || 'Payment failed'
      toast.error(`Payment failed: ${msg}`)
      onFailure?.(msg)
    })

    rzp.open()
  }, [])

  return { openCheckout }
}
