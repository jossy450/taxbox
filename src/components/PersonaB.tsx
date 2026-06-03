import BatchUpload from './BatchUpload'

export default function PersonaB() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Corporate Payroll Manager</h2>
        <p className="text-sm text-gray-600 mt-1">
          Batch-process employee PAYE, generate LIRS-compliant schedules, and export payroll sheets.
        </p>
      </div>
      <BatchUpload />
    </div>
  )
}
