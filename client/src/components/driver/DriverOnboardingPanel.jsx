import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Camera,
  CarFront,
  CheckCircle2,
  Clock3,
  FileText,
  Info,
  Loader2,
  Pencil,
  Shield,
  Upload,
  UserCheck,
  Users,
} from 'lucide-react';
import { getTodaCodePreview } from '../../services/api';
import { parseLicenseOCR } from '../../utils/parseLicenseOCR';

function chipClass(status) {
  const tone = String(status || 'unknown').toLowerCase();
  const palette = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rejected: 'border-red-200 bg-red-50 text-red-700',
    inactive: 'border-slate-200 bg-slate-50 text-slate-700',
    revoked: 'border-rose-200 bg-rose-50 text-rose-700',
    expired: 'border-slate-200 bg-slate-50 text-slate-700',
    president: 'border-blue-200 bg-blue-50 text-blue-700',
    member: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    not_applied: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  return `inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${palette[tone] || 'border-slate-200 bg-slate-50 text-slate-700'}`;
}

function fieldClass() {
  return 'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100';
}

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
          <Icon size={20} className="text-red-500" />
        </div>
        <div>
          <h3 className="text-base font-black text-gray-900">{title}</h3>
          {subtitle && <p className="mt-1 text-xs font-semibold text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  readOnly = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-wide text-gray-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`${fieldClass()} ${readOnly ? 'bg-slate-50 text-slate-500' : ''}`}
      />
    </label>
  );
}

function LabeledTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-wide text-gray-500">{label}</span>
      <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder} className={fieldClass()} />
    </label>
  );
}

function LabeledSelect({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-wide text-gray-500">{label}</span>
      <select value={value} onChange={onChange} className={fieldClass()}>
        {children}
      </select>
    </label>
  );
}

function getDocumentLabel(value, placeholder = 'No file selected') {
  if (!value) {
    return placeholder;
  }

  if (typeof value === 'object' && value.name) {
    return value.name;
  }

  const text = String(value);
  const parts = text.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] || text;
}

function FileField({ label, value, onChange, placeholder }) {
  const inputId = `file-${useId().replace(/:/g, '')}`;

  return (
    <div>
      <span className="mb-2 block text-[11px] font-black uppercase tracking-wide text-gray-500">{label}</span>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-red-300 hover:bg-red-50/40"
      >
        <span className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-600">
          {value ? 'Change File' : 'Choose File'}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-gray-500">
          {getDocumentLabel(value, placeholder || 'No file selected')}
        </span>
      </label>
      <input
        id={inputId}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] || null;
          onChange(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}

function DocumentField({ label, value, onChange, placeholder }) {
  const uploadId = `doc-upload-${useId().replace(/:/g, '')}`;
  const cameraId = `doc-camera-${useId().replace(/:/g, '')}`;
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (value && typeof value === 'object' && value instanceof File && value.type?.startsWith('image/')) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
    return undefined;
  }, [value]);

  function handleFile(event) {
    const file = event.target.files?.[0] || null;
    onChange(file);
    event.target.value = '';
  }

  return (
    <div>
      <span className="mb-2 block text-[11px] font-black uppercase tracking-wide text-gray-500">{label}</span>
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <label
            htmlFor={cameraId}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-600 transition hover:bg-red-100"
          >
            <Camera size={14} />
            Take Photo
          </label>
          <label
            htmlFor={uploadId}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-600 transition hover:bg-slate-200"
          >
            <Upload size={14} />
            Upload
          </label>
          <span className="min-w-0 flex-1 truncate text-right text-xs font-semibold text-gray-400">
            {getDocumentLabel(value, placeholder || 'No file selected')}
          </span>
        </div>

        {preview && (
          <div className="border-t border-gray-100 px-3 py-2">
            <img
              src={preview}
              alt="Document preview"
              className="max-h-28 w-full rounded-xl object-contain"
            />
          </div>
        )}
      </div>

      <input
        id={cameraId}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <input
        id={uploadId}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

const ACCEPTED_VALID_IDS = [
  'Philippine National ID (PhilSys)',
  'Philippine Passport',
  'SSS ID / UMID',
  'GSIS ID',
  'PRC ID (Professional)',
  'PhilHealth ID',
  "Voter's ID (COMELEC)",
  'Postal ID',
  'TIN Card',
  'Senior Citizen ID',
  'PWD ID',
  'NBI Clearance',
  'Police Clearance',
  'Barangay Certificate',
];

function ValidIdField({ label, value, onChange, placeholder }) {
  const uploadId = `vid-upload-${useId().replace(/:/g, '')}`;
  const cameraId = `vid-camera-${useId().replace(/:/g, '')}`;
  const [showList, setShowList] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (value && typeof value === 'object' && value instanceof File && value.type?.startsWith('image/')) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
    return undefined;
  }, [value]);

  function handleFile(event) {
    const file = event.target.files?.[0] || null;
    onChange(file);
    event.target.value = '';
    setShowList(false);
  }

  return (
    <div>
      <span className="mb-2 block text-[11px] font-black uppercase tracking-wide text-gray-500">{label}</span>
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            type="button"
            onClick={() => setShowList((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-600 transition hover:bg-red-100"
          >
            {value ? 'Change ID' : 'Choose ID'}
          </button>
          <span className="min-w-0 flex-1 truncate text-right text-xs font-semibold text-gray-400">
            {getDocumentLabel(value, placeholder || 'No file selected')}
          </span>
        </div>

        {showList && (
          <div className="border-t border-gray-100 px-3 py-3">
            <div className="mb-3 flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2">
              <Info size={14} className="mt-0.5 shrink-0 text-blue-500" />
              <p className="text-xs font-semibold text-blue-700">Select an accepted government ID, then take a photo or upload a file.</p>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-1.5">
              {ACCEPTED_VALID_IDS.map((idName) => (
                <div key={idName} className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5">
                  <CheckCircle2 size={10} className="shrink-0 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-600">{idName}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor={cameraId}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-600 transition hover:bg-red-100"
              >
                <Camera size={14} />
                Take Photo
              </label>
              <label
                htmlFor={uploadId}
                className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-600 transition hover:bg-slate-200"
              >
                <Upload size={14} />
                Upload File
              </label>
            </div>
          </div>
        )}

        {preview && (
          <div className="border-t border-gray-100 px-3 py-2">
            <img
              src={preview}
              alt="Valid ID preview"
              className="max-h-28 w-full rounded-xl object-contain"
            />
          </div>
        )}
      </div>

      <input
        id={cameraId}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <input
        id={uploadId}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

function OcrLicenseInput({ label, value, onChange, licenseNumber, licenseExpiry, onOcrResult, placeholder }) {
  const uploadId = `lic-upload-${useId().replace(/:/g, '')}`;
  const cameraId = `lic-camera-${useId().replace(/:/g, '')}`;
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrDone, setOcrDone] = useState(false);
  const [ocrFailed, setOcrFailed] = useState(false);

  useEffect(() => {
    if (value && typeof value === 'object' && value instanceof File && value.type?.startsWith('image/')) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
    return undefined;
  }, [value]);

  async function handleFile(event) {
    const file = event.target.files?.[0] || null;
    event.target.value = '';
    if (!file) return;

    onChange(file);

    if (!file.type?.startsWith('image/')) {
      setOcrFailed(true);
      setOcrDone(false);
      onOcrResult?.({ licenseNumber: null, expiryDate: null });
      return;
    }

    setScanning(true);
    setProgress(0);
    setOcrDone(false);
    setOcrFailed(false);

    try {
      const result = await parseLicenseOCR(file, setProgress);

      if (result.licenseNumber || result.expiryDate) {
        setOcrDone(true);
        onOcrResult?.(result);
      } else {
        setOcrFailed(true);
        onOcrResult?.({ licenseNumber: null, expiryDate: null });
      }
    } catch {
      setOcrFailed(true);
      onOcrResult?.({ licenseNumber: null, expiryDate: null });
    } finally {
      setScanning(false);
    }
  }

  return (
    <div>
      <span className="mb-2 block text-[11px] font-black uppercase tracking-wide text-gray-500">{label}</span>
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <label
            htmlFor={cameraId}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-red-600 transition hover:bg-red-100"
          >
            <Camera size={14} />
            Take Photo
          </label>
          <label
            htmlFor={uploadId}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-600 transition hover:bg-slate-200"
          >
            <Upload size={14} />
            Upload
          </label>
          <span className="min-w-0 flex-1 truncate text-right text-xs font-semibold text-gray-400">
            {getDocumentLabel(value, placeholder || 'No file selected')}
          </span>
        </div>

        {scanning && (
          <div className="border-t border-gray-100 px-3 py-3">
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-red-500" />
              <span className="text-xs font-bold text-slate-600">Scanning license... {Math.round(progress * 100)}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-300"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {ocrDone && !scanning && (
          <div className="border-t border-gray-100 px-3 py-2">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">License scanned successfully. Fields auto-filled below.</span>
            </div>
          </div>
        )}

        {ocrFailed && !scanning && (
          <div className="border-t border-gray-100 px-3 py-2">
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2">
              <Info size={14} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-700">Could not read license. Please type the details manually.</span>
            </div>
          </div>
        )}

        {preview && !scanning && (
          <div className="border-t border-gray-100 px-3 py-2">
            <img
              src={preview}
              alt="License preview"
              className="max-h-28 w-full rounded-xl object-contain"
            />
          </div>
        )}
      </div>

      <input
        id={cameraId}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <input
        id={uploadId}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

function EditableField({ label, value, onChange, placeholder, type = 'text', locked, onUnlock, autoFilled }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-wide text-gray-500">{label}</span>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={locked}
          className={`${fieldClass()} pr-10 ${locked ? 'cursor-not-allowed bg-slate-50 text-slate-400' : ''}`}
        />
        {locked && (
          <button
            type="button"
            onClick={onUnlock}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
            title="Click to edit manually"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>
      {autoFilled && !locked && (
        <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
          <CheckCircle2 size={10} />
          Auto-filled from license — you can edit if needed
        </span>
      )}
    </label>
  );
}

function formatDate(value) {
  if (!value) return 'Not yet available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return 'Not yet recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-xs font-black uppercase tracking-wide text-gray-400">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-semibold text-gray-700">{value || 'Not set'}</span>
    </div>
  );
}

function findBarangayCodeByName(barangays, barangayName) {
  const target = String(barangayName || '').trim().toLowerCase();
  if (!target) {
    return '';
  }

  const match = barangays.find((item) => item.name.toLowerCase() === target);
  return match?.code || '';
}

const STEP_META = {
  start: {
    title: 'Complete Driver Onboarding',
    subtitle: 'Choose whether to join an approved TODA or register a new TODA as president.',
    icon: Users,
  },
  toda_review: {
    title: 'TODA Application Under LGU Review',
    subtitle: 'Your TODA registration is waiting for LGU approval before members can proceed.',
    icon: Building2,
  },
  membership_review: {
    title: 'Membership Review In Progress',
    subtitle: 'Your selected TODA president still needs to review your membership application.',
    icon: UserCheck,
  },
  franchise_application: {
    title: 'Submit Tricycle Franchise Requirements',
    subtitle: 'Your TODA membership is approved. Submit your tricycle details and franchise documents next.',
    icon: Shield,
  },
  franchise_review: {
    title: 'Franchise Review In Progress',
    subtitle: 'The LGU is reviewing your franchise application.',
    icon: CarFront,
  },
  active: {
    title: 'Driver Account Active',
    subtitle: 'Your TODA membership and franchise are approved. You can now operate normally.',
    icon: CheckCircle2,
  },
};

export default function DriverOnboardingPanel({
  driverProfile,
  approvedTodas,
  nasugbuBarangays,
  submitting,
  onSubmitMembership,
  onSubmitToda,
  onSubmitFranchise,
}) {
  const [pathMode, setPathMode] = useState('join');
  const [membershipForm, setMembershipForm] = useState({
    todaId: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    contactNumber: '',
    driverLicenseDocument: '',
    validIdDocument: '',
  });
  const [todaForm, setTodaForm] = useState({
    todaName: '',
    barangayCode: '',
    routeDescription: '',
    letterOfIntentDocument: '',
    officersListDocument: '',
    barangayApprovalDocument: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    contactNumber: '',
    driverLicenseDocument: '',
    validIdDocument: '',
  });
  const [todaCodePreview, setTodaCodePreview] = useState('');

  function generateQrCode() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TSC-${y}${m}${d}-${rand}`;
  }

  const [franchiseForm, setFranchiseForm] = useState(() => ({
    bodyNumber: '',
    plateNumber: '',
    makeModel: '',
    color: '',
    engineNumber: '',
    chassisNumber: '',
    qrCodeValue: generateQrCode(),
    todaCertificateDocument: '',
    orCrDocument: '',
    insuranceDocument: '',
  }));

  // OCR lock state — fields start locked, unlock after OCR or manual pencil click
  const [membershipLicenseLocked, setMembershipLicenseLocked] = useState(true);
  const [membershipExpiryLocked, setMembershipExpiryLocked] = useState(true);
  const [membershipAutoFilled, setMembershipAutoFilled] = useState(false);
  const [todaLicenseLocked, setTodaLicenseLocked] = useState(true);
  const [todaExpiryLocked, setTodaExpiryLocked] = useState(true);
  const [todaAutoFilled, setTodaAutoFilled] = useState(false);

  function handleMembershipOcr(result) {
    if (result.licenseNumber) {
      setMembershipForm((current) => ({ ...current, licenseNumber: result.licenseNumber }));
      setMembershipLicenseLocked(false);
      setMembershipAutoFilled(true);
    } else {
      setMembershipLicenseLocked(false);
    }
    if (result.expiryDate) {
      setMembershipForm((current) => ({ ...current, licenseExpiryDate: result.expiryDate }));
      setMembershipExpiryLocked(false);
      setMembershipAutoFilled(true);
    } else {
      setMembershipExpiryLocked(false);
    }
  }

  function handleTodaOcr(result) {
    if (result.licenseNumber) {
      setTodaForm((current) => ({ ...current, licenseNumber: result.licenseNumber }));
      setTodaLicenseLocked(false);
      setTodaAutoFilled(true);
    } else {
      setTodaLicenseLocked(false);
    }
    if (result.expiryDate) {
      setTodaForm((current) => ({ ...current, licenseExpiryDate: result.expiryDate }));
      setTodaExpiryLocked(false);
      setTodaAutoFilled(true);
    } else {
      setTodaExpiryLocked(false);
    }
  }

  useEffect(() => {
    if (!driverProfile) return;

    if (driverProfile.ownedToda) {
      setPathMode('create');
    }

    setMembershipForm((prev) => ({
      todaId: driverProfile.todaId ? String(driverProfile.todaId) : prev.todaId,
      // Prefer DB values; otherwise keep what OCR/user already filled (don't clear on profile refresh)
      licenseNumber: driverProfile.licenseNumber || prev.licenseNumber,
      licenseExpiryDate: driverProfile.licenseExpiryDate
        ? String(driverProfile.licenseExpiryDate).slice(0, 10)
        : prev.licenseExpiryDate,
      contactNumber: driverProfile.contactNumber || prev.contactNumber,
      driverLicenseDocument: driverProfile.driverLicenseDocument || prev.driverLicenseDocument,
      validIdDocument: driverProfile.validIdDocument || prev.validIdDocument,
    }));

    // Unlock fields that already have values from a previous submission
    if (driverProfile.licenseNumber) {
      setMembershipLicenseLocked(false);
      setTodaLicenseLocked(false);
    }
    if (driverProfile.licenseExpiryDate) {
      setMembershipExpiryLocked(false);
      setTodaExpiryLocked(false);
    }

    setTodaForm((prev) => ({
      todaName: driverProfile.ownedToda?.todaName || prev.todaName,
      barangayCode: findBarangayCodeByName(nasugbuBarangays, driverProfile.ownedToda?.barangay) || prev.barangayCode,
      routeDescription: driverProfile.ownedToda?.routeDescription || prev.routeDescription,
      letterOfIntentDocument: driverProfile.ownedToda?.letterOfIntentDocument || prev.letterOfIntentDocument,
      officersListDocument: driverProfile.ownedToda?.officersListDocument || prev.officersListDocument,
      barangayApprovalDocument: driverProfile.ownedToda?.barangayApprovalDocument || prev.barangayApprovalDocument,
      // Same as membership: preserve OCR/user values when DB doesn't have them yet
      licenseNumber: driverProfile.licenseNumber || prev.licenseNumber,
      licenseExpiryDate: driverProfile.licenseExpiryDate
        ? String(driverProfile.licenseExpiryDate).slice(0, 10)
        : prev.licenseExpiryDate,
      contactNumber: driverProfile.contactNumber || prev.contactNumber,
      driverLicenseDocument: driverProfile.driverLicenseDocument || prev.driverLicenseDocument,
      validIdDocument: driverProfile.validIdDocument || prev.validIdDocument,
    }));

    setFranchiseForm((prev) => ({
      bodyNumber: driverProfile.bodyNumber || '',
      plateNumber: driverProfile.plateNumber || '',
      makeModel: driverProfile.makeModel || '',
      color: driverProfile.color || '',
      engineNumber: driverProfile.engineNumber || '',
      chassisNumber: driverProfile.chassisNumber || '',
      // Preserve existing QR from DB; keep auto-generated one if none stored yet
      qrCodeValue: driverProfile.qrCodeValue || prev.qrCodeValue,
      todaCertificateDocument: driverProfile.todaCertificateDocument || '',
      orCrDocument: driverProfile.orCrDocument || '',
      insuranceDocument: driverProfile.insuranceDocument || '',
    }));
  }, [driverProfile, nasugbuBarangays]);

  useEffect(() => {
    const selectedBarangay = nasugbuBarangays.find((item) => item.code === todaForm.barangayCode);
    if (!selectedBarangay) {
      setTodaCodePreview(driverProfile?.ownedToda?.todaCode || '');
      return undefined;
    }

    if (
      driverProfile?.ownedToda?.todaCode
      && driverProfile.ownedToda.barangay === selectedBarangay.name
    ) {
      setTodaCodePreview(driverProfile.ownedToda.todaCode);
      return undefined;
    }

    let cancelled = false;

    getTodaCodePreview(todaForm.barangayCode).then((result) => {
      if (cancelled) {
        return;
      }

      if (result?.todaCode) {
        setTodaCodePreview(result.todaCode);
      } else {
        setTodaCodePreview('');
      }
    }).catch(() => {
      if (!cancelled) {
        setTodaCodePreview('');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    driverProfile?.ownedToda?.barangay,
    driverProfile?.ownedToda?.todaCode,
    nasugbuBarangays,
    todaForm.barangayCode,
  ]);

  const stepMeta = useMemo(() => STEP_META[driverProfile?.onboardingStep] || STEP_META.start, [driverProfile?.onboardingStep]);
  const StepIcon = stepMeta.icon;

  if (!driverProfile) {
    return (
      <SectionCard icon={Clock3} title="Loading driver profile" subtitle="Checking your membership and franchise status.">
        <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
          Preparing your onboarding details...
        </div>
      </SectionCard>
    );
  }

  const canResubmitMembership = driverProfile.membershipStatus === 'rejected';
  const canResubmitToda = driverProfile.ownedToda?.status === 'rejected';
  const franchiseWaiting = driverProfile.onboardingStep === 'franchise_review' && driverProfile.franchiseStatus === 'pending';
  const canSubmitFranchise =
    driverProfile.onboardingStep === 'franchise_application'
    || (driverProfile.onboardingStep === 'franchise_review'
      && ['rejected', 'expired', 'revoked'].includes(driverProfile.franchiseStatus || ''));

  return (
    <div className="space-y-5">
      <SectionCard icon={StepIcon} title={stepMeta.title} subtitle={stepMeta.subtitle}>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className={chipClass(driverProfile.membershipStatus)}>{driverProfile.membershipStatus}</span>
          <span className={chipClass(driverProfile.membershipRole)}>{driverProfile.membershipRole}</span>
          {driverProfile.ownedToda?.status && <span className={chipClass(driverProfile.ownedToda.status)}>{driverProfile.ownedToda.status} TODA</span>}
          {driverProfile.franchiseStatus && <span className={chipClass(driverProfile.franchiseStatus)}>{driverProfile.franchiseStatus} franchise</span>}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm font-semibold text-slate-600">
            {driverProfile.canOperate
              ? 'Your account is fully cleared for regular driver operations.'
              : driverProfile.accessMessage || 'Complete the required onboarding steps below.'}
          </p>
        </div>
      </SectionCard>

      {driverProfile.ownedToda && (
        <SectionCard
          icon={Building2}
          title={driverProfile.ownedToda.todaName}
          subtitle="Your TODA registration record"
        >
          <div className="mb-3 flex flex-wrap gap-2">
            <span className={chipClass(driverProfile.ownedToda.status)}>{driverProfile.ownedToda.status}</span>
          </div>
          <SummaryRow label="Barangay" value={driverProfile.ownedToda.barangay} />
          <SummaryRow label="Submitted" value={formatDateTime(driverProfile.ownedToda.submittedAt)} />
          <SummaryRow label="Reviewed" value={formatDateTime(driverProfile.ownedToda.reviewedAt)} />
          <SummaryRow label="Remarks" value={driverProfile.ownedToda.reviewRemarks || 'No remarks yet'} />
          {canResubmitToda && (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              The LGU rejected this TODA application. You can correct the information below and submit a new TODA application.
            </p>
          )}
        </SectionCard>
      )}

      {(driverProfile.onboardingStep === 'start' || canResubmitMembership || canResubmitToda) && !driverProfile.ownedToda?.status?.includes?.('pending') && (
        <SectionCard
          icon={Users}
          title="Choose your onboarding path"
          subtitle="Drivers can either join an approved TODA or register a Nasugbu TODA as president."
        >
          <div className="mb-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPathMode('join')}
              className={`rounded-2xl px-4 py-3 text-sm font-black transition ${pathMode === 'join' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700'}`}
            >
              Join TODA
            </button>
            <button
              type="button"
              onClick={() => setPathMode('create')}
              className={`rounded-2xl px-4 py-3 text-sm font-black transition ${pathMode === 'create' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 text-slate-700'}`}
            >
              Register TODA
            </button>
          </div>

          {pathMode === 'join' && (
            <div className="space-y-4">
              <LabeledSelect
                label="Approved TODA"
                value={membershipForm.todaId}
                onChange={(event) => setMembershipForm((current) => ({ ...current, todaId: event.target.value }))}
              >
                <option value="">Select a TODA</option>
                {approvedTodas.map((item) => (
                  <option key={item.todaId} value={item.todaId}>
                    {item.todaName} - {item.barangay}
                  </option>
                ))}
              </LabeledSelect>

              <OcrLicenseInput
                label="Driver License Document"
                value={membershipForm.driverLicenseDocument}
                onChange={(file) => setMembershipForm((current) => ({ ...current, driverLicenseDocument: file }))}
                onOcrResult={handleMembershipOcr}
                placeholder="license-front.jpg"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <EditableField
                  label="License Number"
                  value={membershipForm.licenseNumber}
                  onChange={(event) => setMembershipForm((current) => ({ ...current, licenseNumber: event.target.value }))}
                  placeholder="N01-23-123456"
                  locked={membershipLicenseLocked}
                  onUnlock={() => setMembershipLicenseLocked(false)}
                  autoFilled={membershipAutoFilled}
                />
                <EditableField
                  label="License Expiry"
                  type="date"
                  value={membershipForm.licenseExpiryDate}
                  onChange={(event) => setMembershipForm((current) => ({ ...current, licenseExpiryDate: event.target.value }))}
                  locked={membershipExpiryLocked}
                  onUnlock={() => setMembershipExpiryLocked(false)}
                  autoFilled={membershipAutoFilled}
                />
              </div>

              <LabeledInput
                label="Contact Number"
                value={membershipForm.contactNumber}
                onChange={(event) => setMembershipForm((current) => ({ ...current, contactNumber: event.target.value }))}
                placeholder="09XXXXXXXXX"
              />

              <ValidIdField
                label="Valid ID Document"
                value={membershipForm.validIdDocument}
                onChange={(file) => setMembershipForm((current) => ({ ...current, validIdDocument: file }))}
                placeholder="valid-id.jpg"
              />

              <button
                type="button"
                disabled={submitting}
                onClick={() => onSubmitMembership({ ...membershipForm, todaId: Number(membershipForm.todaId) })}
                className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:opacity-70"
              >
                {submitting ? 'Submitting membership...' : canResubmitMembership ? 'Resubmit Membership Application' : 'Apply for TODA Membership'}
              </button>
            </div>
          )}

          {pathMode === 'create' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <LabeledInput
                  label="TODA Name"
                  value={todaForm.todaName}
                  onChange={(event) => setTodaForm((current) => ({ ...current, todaName: event.target.value }))}
                  placeholder="San Roque TODA"
                />
                <LabeledInput
                  label="TODA Code"
                  value={todaCodePreview || ''}
                  onChange={() => {}}
                  placeholder="Generated automatically after selecting a barangay"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <LabeledSelect
                  label="Barangay"
                  value={todaForm.barangayCode}
                  onChange={(event) => setTodaForm((current) => ({ ...current, barangayCode: event.target.value }))}
                >
                  <option value="">Select a Nasugbu barangay</option>
                  {nasugbuBarangays.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </LabeledSelect>
                <div className="rounded-2xl border border-red-100 bg-red-50/70 px-4 py-4">
                  <p className="text-[11px] font-black uppercase tracking-wide text-red-500">Coverage</p>
                  <p className="mt-2 text-sm font-black text-slate-900">Nasugbu, Batangas</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    The TODA registry is limited to official barangays within Nasugbu.
                  </p>
                </div>
              </div>

              <LabeledTextarea
                label="Route Description"
                value={todaForm.routeDescription}
                onChange={(event) => setTodaForm((current) => ({ ...current, routeDescription: event.target.value }))}
                placeholder="Describe the TODA route and terminal coverage."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FileField
                  label="Letter of Intent"
                  value={todaForm.letterOfIntentDocument}
                  onChange={(file) => setTodaForm((current) => ({ ...current, letterOfIntentDocument: file }))}
                  placeholder="letter-of-intent.pdf"
                />
                <FileField
                  label="Officers List"
                  value={todaForm.officersListDocument}
                  onChange={(file) => setTodaForm((current) => ({ ...current, officersListDocument: file }))}
                  placeholder="officers-list.pdf"
                />
                <FileField
                  label="Barangay Approval"
                  value={todaForm.barangayApprovalDocument}
                  onChange={(file) => setTodaForm((current) => ({ ...current, barangayApprovalDocument: file }))}
                  placeholder="barangay-approval.pdf"
                />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-4 text-xs font-black uppercase tracking-wide text-slate-500">President Driver Record</p>

                <OcrLicenseInput
                  label="Driver License Document"
                  value={todaForm.driverLicenseDocument}
                  onChange={(file) => setTodaForm((current) => ({ ...current, driverLicenseDocument: file }))}
                  onOcrResult={handleTodaOcr}
                  placeholder="license-front.jpg"
                />

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <EditableField
                    label="License Number"
                    value={todaForm.licenseNumber}
                    onChange={(event) => setTodaForm((current) => ({ ...current, licenseNumber: event.target.value }))}
                    placeholder="N01-23-123456"
                    locked={todaLicenseLocked}
                    onUnlock={() => setTodaLicenseLocked(false)}
                    autoFilled={todaAutoFilled}
                  />
                  <EditableField
                    label="License Expiry"
                    type="date"
                    value={todaForm.licenseExpiryDate}
                    onChange={(event) => setTodaForm((current) => ({ ...current, licenseExpiryDate: event.target.value }))}
                    locked={todaExpiryLocked}
                    onUnlock={() => setTodaExpiryLocked(false)}
                    autoFilled={todaAutoFilled}
                  />
                  <LabeledInput
                    label="Contact Number"
                    value={todaForm.contactNumber}
                    onChange={(event) => setTodaForm((current) => ({ ...current, contactNumber: event.target.value }))}
                    placeholder="09XXXXXXXXX"
                  />
                </div>
                <div className="mt-4">
                  <ValidIdField
                    label="Valid ID Document"
                    value={todaForm.validIdDocument}
                    onChange={(file) => setTodaForm((current) => ({ ...current, validIdDocument: file }))}
                    placeholder="valid-id.jpg"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={() => onSubmitToda(todaForm)}
                className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:opacity-70"
              >
                {submitting ? 'Submitting TODA...' : canResubmitToda ? 'Submit New TODA Application' : 'Register TODA for LGU Review'}
              </button>
            </div>
          )}
        </SectionCard>
      )}

      {driverProfile.membershipStatus === 'pending' && (
        <SectionCard icon={Clock3} title="Membership waiting for TODA review" subtitle="The TODA president still needs to confirm your membership documents.">
          <SummaryRow label="Selected TODA" value={driverProfile.todaName || 'Not assigned'} />
          <SummaryRow label="Applied" value={formatDateTime(driverProfile.membershipAppliedAt)} />
          <SummaryRow label="License Number" value={driverProfile.licenseNumber} />
          <SummaryRow label="Remarks" value={driverProfile.membershipRemarks || 'No remarks yet'} />
        </SectionCard>
      )}

      {(canSubmitFranchise || franchiseWaiting || driverProfile.canOperate) && (
        <SectionCard
          icon={Shield}
          title="Franchise and Tricycle Records"
          subtitle="LGU review is required before the driver can operate."
        >
          <div className="mb-4 flex flex-wrap gap-2">
            {driverProfile.tricycleStatus && <span className={chipClass(driverProfile.tricycleStatus)}>{driverProfile.tricycleStatus} tricycle</span>}
            {driverProfile.franchiseStatus && <span className={chipClass(driverProfile.franchiseStatus)}>{driverProfile.franchiseStatus} franchise</span>}
          </div>

          {(franchiseWaiting || driverProfile.canOperate) && (
            <div className="mb-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <SummaryRow label="Body Number" value={driverProfile.bodyNumber || 'Not assigned'} />
              <SummaryRow label="Plate Number" value={driverProfile.plateNumber || 'Not submitted'} />
              <SummaryRow label="Issue Date" value={formatDate(driverProfile.franchiseIssueDate)} />
              <SummaryRow label="Expiry Date" value={formatDate(driverProfile.franchiseExpiryDate || driverProfile.franchiseExpiry)} />
              <SummaryRow label="LGU Reference" value={driverProfile.lguReferenceNo || 'Not yet assigned'} />
              <SummaryRow label="Reviewed" value={formatDateTime(driverProfile.franchiseReviewedAt)} />
              <SummaryRow label="Remarks" value={driverProfile.franchiseRemarks || 'No remarks yet'} />
            </div>
          )}

          {franchiseWaiting && (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              Your franchise application is still pending with the LGU. You can update the form only after a rejection, expiry, or revocation.
            </p>
          )}

          {canSubmitFranchise && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <LabeledInput
                  label="Body Number"
                  value={franchiseForm.bodyNumber}
                  onChange={(event) => setFranchiseForm((current) => ({ ...current, bodyNumber: event.target.value }))}
                  placeholder="023"
                />
                <LabeledInput
                  label="Plate Number"
                  value={franchiseForm.plateNumber}
                  onChange={(event) => setFranchiseForm((current) => ({ ...current, plateNumber: event.target.value }))}
                  placeholder="ABC-1234"
                />
                <LabeledInput
                  label="Make / Model"
                  value={franchiseForm.makeModel}
                  onChange={(event) => setFranchiseForm((current) => ({ ...current, makeModel: event.target.value }))}
                  placeholder="Honda TMX"
                />
                <LabeledInput
                  label="Color"
                  value={franchiseForm.color}
                  onChange={(event) => setFranchiseForm((current) => ({ ...current, color: event.target.value }))}
                  placeholder="Red"
                />
                <LabeledInput
                  label="Engine Number"
                  value={franchiseForm.engineNumber}
                  onChange={(event) => setFranchiseForm((current) => ({ ...current, engineNumber: event.target.value }))}
                  placeholder="ENG-12345"
                />
                <LabeledInput
                  label="Chassis Number"
                  value={franchiseForm.chassisNumber}
                  onChange={(event) => setFranchiseForm((current) => ({ ...current, chassisNumber: event.target.value }))}
                  placeholder="CHS-12345"
                />
              </div>

              <div className="relative">
                <LabeledInput
                  label="QR Code Value"
                  value={franchiseForm.qrCodeValue}
                  onChange={() => {}}
                  placeholder="Auto-generated"
                  readOnly
                />
                <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <CheckCircle2 size={10} /> Auto-generated — cannot be edited
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FileField
                  label="TODA Certificate"
                  value={franchiseForm.todaCertificateDocument}
                  onChange={(file) => setFranchiseForm((current) => ({ ...current, todaCertificateDocument: file }))}
                  placeholder="toda-certificate.pdf"
                />
                <FileField
                  label="OR / CR"
                  value={franchiseForm.orCrDocument}
                  onChange={(file) => setFranchiseForm((current) => ({ ...current, orCrDocument: file }))}
                  placeholder="orcr.pdf"
                />
              </div>

              <FileField
                label="Insurance Document"
                value={franchiseForm.insuranceDocument}
                onChange={(file) => setFranchiseForm((current) => ({ ...current, insuranceDocument: file }))}
                placeholder="insurance.pdf"
              />

              <button
                type="button"
                disabled={submitting}
                onClick={() => onSubmitFranchise(franchiseForm)}
                className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:opacity-70"
              >
                {submitting ? 'Submitting franchise...' : driverProfile.franchiseStatus ? 'Resubmit Franchise Application' : 'Submit Franchise Application'}
              </button>
            </div>
          )}

          {driverProfile.canOperate && (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              Your driver account is already active. The information above reflects the current approved franchise details.
            </div>
          )}
        </SectionCard>
      )}

      <SectionCard icon={FileText} title="Current account records" subtitle="This is the profile data currently stored for your driver account.">
        <SummaryRow label="TODA" value={driverProfile.todaName || 'Not assigned'} />
        <SummaryRow label="License Number" value={driverProfile.licenseNumber || 'Not yet provided'} />
        <SummaryRow label="License Expiry" value={formatDate(driverProfile.licenseExpiryDate)} />
        <SummaryRow label="Contact Number" value={driverProfile.contactNumber || 'Not yet provided'} />
        <SummaryRow label="Pending Member Reviews" value={String(driverProfile.pendingMembershipRequests || 0)} />
      </SectionCard>
    </div>
  );
}
