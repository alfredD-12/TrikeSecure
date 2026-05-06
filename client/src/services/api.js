export const API_URL = import.meta.env.VITE_API_URL || '/api';

function isFileLike(value) {
  if (typeof File !== 'undefined' && value instanceof File) {
    return true;
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return true;
  }

  return false;
}

function appendFormValue(formData, key, value) {
  if (value == null || value === '') {
    return;
  }

  if (isFileLike(value)) {
    formData.append(key, value, value.name || key);
    return;
  }

  formData.append(key, String(value));
}

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => ({ message: 'Invalid JSON response from server.' }));
    if (!res.ok) {
      return { ...data, message: data?.message || `Request failed with status ${res.status}.` };
    }
    return data;
  }

  const text = await res.text().catch(() => '');
  if (!res.ok) {
    return {
      message: `Server returned a non-JSON ${res.status} response. Check that the backend is running and that you opened the active Vite port.`,
      details: text.slice(0, 200),
    };
  }

  return text ? { message: text } : { message: 'Request succeeded.' };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
  });

  return parseResponse(res);
}

export async function register(fullName, username, email, password, role = 'commuter') {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ fullName, username, email, password, role }),
  });
  return parseResponse(res);
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  return parseResponse(res);
}

export async function logout() {
  return apiFetch('/auth/logout', {
    method: 'POST',
  });
}

export async function getMe() {
  return apiFetch('/auth/me');
}

export async function getDriverByQr(qrValue) {
  const encoded = encodeURIComponent(qrValue);
  return apiFetch(`/scan/qr/${encoded}`);
}

export async function bookRide(pickup, dropoff, pickupLat = null, pickupLng = null, dropoffLat = null, dropoffLng = null) {
  const res = await fetch(`${API_URL}/rides/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ pickup, dropoff, pickupLat, pickupLng, dropoffLat, dropoffLng }),
  });
  return parseResponse(res);
}

export async function getActiveRide() {
  return apiFetch('/rides/active');
}

export async function getRideStatus(requestId) {
  return apiFetch(`/rides/${requestId}/status`);
}

export async function cancelRide(requestId) {
  return apiFetch(`/rides/${requestId}/cancel`, {
    method: 'POST',
  });
}

export async function markRideArrived(requestId) {
  return apiFetch(`/rides/${requestId}/arrive`, {
    method: 'POST',
  });
}

export async function startRide(requestId) {
  return apiFetch(`/rides/${requestId}/start`, {
    method: 'POST',
  });
}

export async function completeRide(requestId) {
  return apiFetch(`/rides/${requestId}/complete`, {
    method: 'POST',
  });
}

export async function updateDriverRideLocation(requestId, location) {
  return apiFetch(`/rides/${requestId}/driver-location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(location),
  });
}

export async function getDriverProfile() {
  return apiFetch('/rides/driver-profile');
}

export async function getFuelPrices() {
  return apiFetch('/fuel/prices');
}

export async function getDriverOnboarding() {
  return apiFetch('/driver/onboarding');
}

export async function getApprovedDriverTodas() {
  return apiFetch('/driver/todas');
}

export async function getNasugbuBarangays() {
  return apiFetch('/driver/reference/nasugbu-barangays');
}

export async function getTodaCodePreview(barangayCode) {
  const params = new URLSearchParams();
  if (barangayCode) {
    params.set('barangayCode', barangayCode);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/driver/reference/toda-code-preview${suffix}`);
}

export async function submitDriverMembershipApplication(payload) {
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    appendFormValue(formData, key, value);
  });

  const res = await fetch(`${API_URL}/driver/membership-application`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  return parseResponse(res);
}

export async function submitDriverTodaApplication(payload) {
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    appendFormValue(formData, key, value);
  });

  const res = await fetch(`${API_URL}/driver/toda-application`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  return parseResponse(res);
}

export async function getPresidentMembershipRequests(status = 'pending') {
  const params = new URLSearchParams();
  if (status) {
    params.set('status', status);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/driver/membership-requests${suffix}`);
}

export async function reviewPresidentMembershipRequest(driverId, payload) {
  return apiFetch(`/driver/membership-requests/${driverId}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function submitDriverFranchiseApplication(payload) {
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    appendFormValue(formData, key, value);
  });

  const res = await fetch(`${API_URL}/driver/franchise-application`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  return parseResponse(res);
}

export async function triggerSOS(latitude, longitude, rideId = null, message = null) {
  const res = await fetch(`${API_URL}/sos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ latitude, longitude, rideId, message }),
  });
  return parseResponse(res);
}

export async function getAdminTodas(status = null) {
  const params = new URLSearchParams();
  if (status) {
    params.set('status', status);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/admin/todas${suffix}`);
}

export async function reviewAdminToda(todaId, status, remarks = '') {
  return apiFetch(`/admin/todas/${todaId}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, remarks }),
  });
}

export async function getAdminDrivers(membershipStatus = null) {
  const params = new URLSearchParams();
  if (membershipStatus) {
    params.set('membershipStatus', membershipStatus);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/admin/drivers${suffix}`);
}

export async function getAdminFranchises(status = null) {
  const params = new URLSearchParams();
  if (status) {
    params.set('status', status);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/admin/franchises${suffix}`);
}

export async function reviewAdminFranchise(franchiseId, payload) {
  return apiFetch(`/admin/franchises/${franchiseId}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function reviewAdminDriver(driverId, status, remarks = '') {
  return apiFetch(`/admin/drivers/${driverId}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, remarks }),
  });
}

export async function searchDriversByBodyNumber(plateNumber) {
  const params = new URLSearchParams();
  if (plateNumber) {
    params.set('plateNumber', plateNumber);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/complaints/drivers/search${suffix}`);
}

export async function submitComplaint(payload) {
  const res = await fetch(`${API_URL}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseResponse(res);
}

export async function getProfile() {
  return apiFetch('/profile/me');
}

export async function updateProfile(payload) {
  const res = await fetch(`${API_URL}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseResponse(res);
}

export async function updatePassword(newPassword) {
  const res = await fetch(`${API_URL}/profile/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ newPassword }),
  });
  return parseResponse(res);
}

export async function getRideHistory(limit = 20, offset = 0) {
  return apiFetch(`/rides/history?limit=${limit}&offset=${offset}`);
}

export async function getComplaintHistory(limit = 20, offset = 0) {
  return apiFetch(`/complaints/history?limit=${limit}&offset=${offset}`);
}

export async function getSOSHistory(limit = 20, offset = 0) {
  return apiFetch(`/sos/history?limit=${limit}&offset=${offset}`);
}

export async function contactSupport(payload) {
  const res = await fetch(`${API_URL}/support/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseResponse(res);
}
export async function submitRating(payload) {
  const res = await fetch(`${API_URL}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return parseResponse(res);
}

export async function getFareSettings() {
  const res = await fetch(`${API_URL}/fare/latest`, { credentials: 'include' });
  return parseResponse(res);
}


export async function getDriverRideHistory(limit = 30, offset = 0) {
  return apiFetch(`/rides/driver-history?limit=${limit}&offset=${offset}`);
}

export async function getAdminComplaints(status = null) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/admin/complaints${suffix}`);
}

export async function resolveAdminComplaint(complaintId) {
  return apiFetch(`/admin/complaints/${complaintId}/resolve`, { method: 'PATCH' });
}

export async function getAdminRatings() {
  return apiFetch(`/admin/ratings`);
}
