import React, { useState } from 'react';
import { BASE_URL } from '../services/api';
import axios from 'axios';
import './PaymentForm.css';

const PaymentForm = ({ totalAmount, onPaymentSubmit, onCancel, bookingType }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [discountedAmount, setDiscountedAmount] = useState(totalAmount);
  const [paymentDetails, setPaymentDetails] = useState({
    // Credit/Debit Card
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
    // Mobile Banking
    mobileNumber: '',
    // Bank Transfer
    bankName: '',
    accountNumber: ''
  });
  const [errors, setErrors] = useState({});

  const validateCardNumber = (number) => {
    return /^\d{16}$/.test(number.replace(/\s/g, ''));
  };

  const validateExpiryDate = (date) => {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(date)) return false;
    
    const [month, year] = date.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    return expiry > new Date();
  };

  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const validateMobile = (mobile) => {
    return /^01[3-9]\d{8}$/.test(mobile);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/coupons/validate`, {
        code: couponCode,
        serviceType: bookingType || 'tour',
        amount: totalAmount
      });

      setCouponData(response.data.data);
      setCouponApplied(true);
      setDiscountedAmount(response.data.data.finalAmount);
      alert('✅ Coupon applied successfully! Discount: ৳' + response.data.data.discount);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid coupon code';
      alert('❌ ' + errorMsg);
      setCouponApplied(false);
      setCouponData(null);
      setDiscountedAmount(totalAmount);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setCouponData(null);
    setDiscountedAmount(totalAmount);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setPaymentDetails({ ...paymentDetails, [name]: formatted });
    } 
    // Format expiry date
    else if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2');
      setPaymentDetails({ ...paymentDetails, [name]: formatted });
    }
    else {
      setPaymentDetails({ ...paymentDetails, [name]: value });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
      setErrors(newErrors);
      return false;
    }

    if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
      if (!paymentDetails.cardNumber || !validateCardNumber(paymentDetails.cardNumber)) {
        newErrors.cardNumber = 'Invalid card number (must be 16 digits)';
      }
      if (!paymentDetails.cardHolderName || paymentDetails.cardHolderName.trim().length < 3) {
        newErrors.cardHolderName = 'Card holder name is required';
      }
      if (!paymentDetails.expiryDate || !validateExpiryDate(paymentDetails.expiryDate)) {
        newErrors.expiryDate = 'Invalid or expired date (MM/YY)';
      }
      if (!paymentDetails.cvv || !validateCVV(paymentDetails.cvv)) {
        newErrors.cvv = 'Invalid CVV (3-4 digits)';
      }
    } 
    else if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') {
      if (!paymentDetails.mobileNumber || !validateMobile(paymentDetails.mobileNumber)) {
        newErrors.mobileNumber = 'Invalid mobile number (e.g., 01712345678)';
      }
    }
    else if (paymentMethod === 'bank-transfer') {
      if (!paymentDetails.bankName || paymentDetails.bankName.trim().length < 2) {
        newErrors.bankName = 'Bank name is required';
      }
      if (!paymentDetails.accountNumber || paymentDetails.accountNumber.trim().length < 5) {
        newErrors.accountNumber = 'Valid account number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Generate a mock transaction ID
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const paymentData = {
        paymentMethod,
        paymentDetails: { ...paymentDetails },
        transactionId,
        paymentStatus: 'paid',
        paidAt: new Date()
      };

      // Add coupon data if applied
      if (couponApplied && couponData) {
        paymentData.couponCode = couponData.code;
        paymentData.originalAmount = totalAmount;
        paymentData.discountAmount = couponData.discount;
        paymentData.totalAmount = couponData.finalAmount;
      }

      onPaymentSubmit(paymentData);
    }
  };

  const renderPaymentMethodIcon = (method) => {
    const icons = {
      'credit-card': '💳',
      'debit-card': '💳',
      'bkash': '📱',
      'nagad': '📱',
      'rocket': '📱',
      'bank-transfer': '🏦'
    };
    return icons[method] || '💰';
  };

  return (
    <div className="payment-form-container">
      <div className="payment-header">
        <h3>Payment Details</h3>
        <div className="payment-amount">
          <span>Total Amount:</span>
          <strong>৳{totalAmount?.toLocaleString()}</strong>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="coupon-section">
        <h4>Have a Coupon Code?</h4>
        {!couponApplied ? (
          <div className="coupon-input-group">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="coupon-input"
              disabled={couponLoading}
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="apply-coupon-btn"
              disabled={couponLoading}
            >
              {couponLoading ? 'Checking...' : 'Apply'}
            </button>
          </div>
        ) : (
          <div className="coupon-applied">
            <div className="coupon-success">
              <span className="success-icon">✅</span>
              <div className="coupon-details">
                <strong>{couponData.code}</strong>
                <p>{couponData.description}</p>
                <p className="discount-info">
                  Discount: <strong>৳{couponData.discount.toLocaleString()}</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="remove-coupon-btn"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Amount Summary */}
      {couponApplied && (
        <div className="amount-summary">
          <div className="summary-row">
            <span>Original Amount:</span>
            <span>৳{totalAmount.toLocaleString()}</span>
          </div>
          <div className="summary-row discount">
            <span>Discount:</span>
            <span>-৳{couponData.discount.toLocaleString()}</span>
          </div>
          <div className="summary-row total">
            <span>Final Amount:</span>
            <strong>৳{discountedAmount.toLocaleString()}</strong>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="payment-method-selection">
          <label>Select Payment Method *</label>
          <div className="payment-methods">
            {['credit-card', 'debit-card', 'bkash', 'nagad', 'rocket', 'bank-transfer'].map((method) => (
              <div
                key={method}
                className={`payment-method-option ${paymentMethod === method ? 'selected' : ''}`}
                onClick={() => {
                  setPaymentMethod(method);
                  setErrors({});
                }}
              >
                <span className="method-icon">{renderPaymentMethodIcon(method)}</span>
                <span className="method-name">
                  {method.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </div>
            ))}
          </div>
          {errors.paymentMethod && <span className="error-message">{errors.paymentMethod}</span>}
        </div>

        {/* Credit/Debit Card Form */}
        {(paymentMethod === 'credit-card' || paymentMethod === 'debit-card') && (
          <div className="payment-details-section">
            <div className="form-group">
              <label>Card Number *</label>
              <input
                type="text"
                name="cardNumber"
                value={paymentDetails.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className={errors.cardNumber ? 'error' : ''}
              />
              {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
            </div>

            <div className="form-group">
              <label>Card Holder Name *</label>
              <input
                type="text"
                name="cardHolderName"
                value={paymentDetails.cardHolderName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={errors.cardHolderName ? 'error' : ''}
              />
              {errors.cardHolderName && <span className="error-message">{errors.cardHolderName}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date *</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={paymentDetails.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  className={errors.expiryDate ? 'error' : ''}
                />
                {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
              </div>

              <div className="form-group">
                <label>CVV *</label>
                <input
                  type="text"
                  name="cvv"
                  value={paymentDetails.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="4"
                  className={errors.cvv ? 'error' : ''}
                />
                {errors.cvv && <span className="error-message">{errors.cvv}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Banking Form */}
        {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
          <div className="payment-details-section">
            <div className="form-group">
              <label>Mobile Number *</label>
              <input
                type="text"
                name="mobileNumber"
                value={paymentDetails.mobileNumber}
                onChange={handleInputChange}
                placeholder="01712345678"
                maxLength="11"
                className={errors.mobileNumber ? 'error' : ''}
              />
              {errors.mobileNumber && <span className="error-message">{errors.mobileNumber}</span>}
              <small className="form-hint">
                Enter your {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} registered mobile number
              </small>
            </div>
          </div>
        )}

        {/* Bank Transfer Form */}
        {paymentMethod === 'bank-transfer' && (
          <div className="payment-details-section">
            <div className="form-group">
              <label>Bank Name *</label>
              <input
                type="text"
                name="bankName"
                value={paymentDetails.bankName}
                onChange={handleInputChange}
                placeholder="e.g., Dutch Bangla Bank"
                className={errors.bankName ? 'error' : ''}
              />
              {errors.bankName && <span className="error-message">{errors.bankName}</span>}
            </div>

            <div className="form-group">
              <label>Account Number *</label>
              <input
                type="text"
                name="accountNumber"
                value={paymentDetails.accountNumber}
                onChange={handleInputChange}
                placeholder="Enter your account number"
                className={errors.accountNumber ? 'error' : ''}
              />
              {errors.accountNumber && <span className="error-message">{errors.accountNumber}</span>}
            </div>
          </div>
        )}

        {paymentMethod && (
          <div className="payment-notice">
            <p>⚠️ This is a simulated payment system. No real transaction will occur.</p>
            <p>Click "Proceed to Pay" to complete your booking.</p>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-pay">
            Proceed to Pay ৳{totalAmount?.toLocaleString()}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
