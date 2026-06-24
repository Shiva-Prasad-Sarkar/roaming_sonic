import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../services/api';
import axios from 'axios';
import './ManageCoupons.css';

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    serviceTypes: ['all'],
    minPurchaseAmount: 0,
    maxDiscountAmount: '',
    validFrom: '',
    validTo: '',
    usageLimit: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(response.data.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      alert('Error fetching coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleServiceTypeChange = (service) => {
    setFormData(prev => {
      let newServiceTypes = [...prev.serviceTypes];
      
      if (service === 'all') {
        newServiceTypes = ['all'];
      } else {
        // Remove 'all' if selecting specific service
        newServiceTypes = newServiceTypes.filter(s => s !== 'all');
        
        if (newServiceTypes.includes(service)) {
          newServiceTypes = newServiceTypes.filter(s => s !== service);
        } else {
          newServiceTypes.push(service);
        }
        
        // If no services selected, default to 'all'
        if (newServiceTypes.length === 0) {
          newServiceTypes = ['all'];
        }
      }
      
      return { ...prev, serviceTypes: newServiceTypes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minPurchaseAmount: parseFloat(formData.minPurchaseAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
      };

      if (editMode && selectedCoupon) {
        await axios.put(
          `${BASE_URL}/api/coupons/${selectedCoupon._id}`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('✅ Coupon updated successfully');
      } else {
        await axios.post(
          `${BASE_URL}/api/coupons`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('✅ Coupon created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error saving coupon';
      alert('❌ ' + errorMsg);
    }
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setEditMode(true);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      serviceTypes: coupon.serviceTypes,
      minPurchaseAmount: coupon.minPurchaseAmount,
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      validFrom: coupon.validFrom.split('T')[0],
      validTo: coupon.validTo.split('T')[0],
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      alert('❌ Error deleting coupon');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/api/coupons/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCoupons();
    } catch (error) {
      alert('❌ Error toggling coupon status');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      serviceTypes: ['all'],
      minPurchaseAmount: 0,
      maxDiscountAmount: '',
      validFrom: '',
      validTo: '',
      usageLimit: '',
      isActive: true
    });
    setEditMode(false);
    setSelectedCoupon(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="manage-coupons">
      <div className="coupons-header">
        <h2>Manage Coupons</h2>
        <button className="add-btn" onClick={openCreateModal}>
          + Add New Coupon
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="no-coupons">
          <p>No coupons available</p>
          <button onClick={openCreateModal}>Create First Coupon</button>
        </div>
      ) : (
        <div className="coupons-table-container">
          <table className="coupons-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Services</th>
                <th>Valid Period</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon._id}>
                  <td>
                    <strong className="coupon-code">{coupon.code}</strong>
                  </td>
                  <td>{coupon.description}</td>
                  <td>
                    {coupon.discountType === 'percentage' 
                      ? `${coupon.discountValue}%`
                      : `৳${coupon.discountValue}`
                    }
                    {coupon.maxDiscountAmount && (
                      <div className="max-discount">Max: ৳{coupon.maxDiscountAmount}</div>
                    )}
                  </td>
                  <td>
                    <div className="service-badges">
                      {coupon.serviceTypes.map((service, idx) => (
                        <span key={idx} className="service-badge">
                          {service}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="date-range">
                      <div>{new Date(coupon.validFrom).toLocaleDateString()}</div>
                      <div>to</div>
                      <div>{new Date(coupon.validTo).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td>
                    {coupon.usedCount}/{coupon.usageLimit || '∞'}
                  </td>
                  <td>
                    <button
                      className={`status-badge ${coupon.isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleStatus(coupon._id)}
                    >
                      {coupon.isActive ? '✓ Active' : '✗ Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn-small"
                        onClick={() => handleEdit(coupon)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn-small"
                        onClick={() => handleDelete(coupon._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editMode ? 'Edit Coupon' : 'Create New Coupon'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="coupon-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Coupon Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., SUMMER2026"
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group">
                  <label>Discount Type *</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer discount on all tours"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    placeholder={formData.discountType === 'percentage' ? '10' : '500'}
                    min="0"
                    step="0.01"
                    required
                  />
                  <small>
                    {formData.discountType === 'percentage' ? 'Enter percentage (e.g., 10 for 10%)' : 'Enter amount in BDT'}
                  </small>
                </div>

                <div className="form-group">
                  <label>Max Discount Amount</label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    min="0"
                  />
                  <small>Optional cap for percentage discounts</small>
                </div>
              </div>

              <div className="form-group">
                <label>Applicable Services *</label>
                <div className="checkbox-group">
                  {['all', 'hotel', 'tour', 'bus', 'guide'].map(service => (
                    <label key={service} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.serviceTypes.includes(service)}
                        onChange={() => handleServiceTypeChange(service)}
                      />
                      {service.charAt(0).toUpperCase() + service.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Purchase Amount</label>
                  <input
                    type="number"
                    name="minPurchaseAmount"
                    value={formData.minPurchaseAmount}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    placeholder="Unlimited"
                    min="1"
                  />
                  <small>Leave empty for unlimited usage</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valid From *</label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Valid To *</label>
                  <input
                    type="date"
                    name="validTo"
                    value={formData.validTo}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editMode ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoupons;
