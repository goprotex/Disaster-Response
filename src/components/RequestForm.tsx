'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { processImages, getBestLocation, validateImageFiles } from '@/lib/utils'

interface RequestFormProps {
  onClose: () => void
  onSubmit: (request: any) => void
}

export default function RequestForm({ onClose, onSubmit }: RequestFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other' as const,
    urgency: 'Low' as const,
    contactName: '',
    contactPhone: '',
    isContactShared: true,
    gpsLat: '',
    gpsLng: '',
  })

  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)
      const validationErrors = validateImageFiles(fileList)
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        return
      }

      setFiles(fileList)
      setErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors([])

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required')
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to submit a request')
      }

      // Process images if any
      let photoUrls: string[] = []
      let exifDataArray: any[] = []
      let bestLocation = null

      if (files.length > 0) {
        const processedImages = await processImages(files)
        
        // Upload images to Supabase Storage
        for (let i = 0; i < processedImages.length; i++) {
          const { file, exifData } = processedImages[i]
          const fileName = `${Date.now()}-${i}-${file.name}`
          const filePath = `requests/${user.id}/${fileName}`

          const { data, error } = await supabase.storage
            .from('photos')
            .upload(filePath, file)

          if (error) {
            console.error('Upload error:', error)
            throw new Error(`Failed to upload image ${i + 1}`)
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(filePath)

          photoUrls.push(publicUrl)
          exifDataArray.push(exifData)
        }

        // Try to get location from EXIF data
        bestLocation = getBestLocation(
          exifDataArray,
          parseFloat(formData.gpsLat) || undefined,
          parseFloat(formData.gpsLng) || undefined
        )
      } else if (formData.gpsLat && formData.gpsLng) {
        // Use manually entered coordinates
        bestLocation = {
          lat: parseFloat(formData.gpsLat),
          lng: parseFloat(formData.gpsLng)
        }
      }

      // Create request in database
      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        urgency: formData.urgency,
        contact_name: formData.contactName.trim() || null,
        contact_phone: formData.contactPhone.trim() || null,
        is_contact_shared: formData.isContactShared,
        photo_urls: photoUrls.length > 0 ? photoUrls : null,
        exif_data: exifDataArray.length > 0 ? exifDataArray : null,
        gps_lat: bestLocation?.lat || null,
        gps_lng: bestLocation?.lng || null,
        photo_taken_time: exifDataArray[0]?.dateTime || null,
        created_by: user.id,
      }

      const { data, error } = await supabase
        .from('requests')
        .insert([requestData])
        .select()

      if (error) {
        throw new Error(error.message)
      }

      // Success!
      onSubmit(data[0])
      onClose()
    } catch (error) {
      console.error('Submit error:', error)
      setErrors([error instanceof Error ? error.message : 'An unexpected error occurred'])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Report a Need</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-disaster-blue"
                placeholder="Brief description of what you need"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-disaster-blue"
                placeholder="Additional details about your need"
              />
            </div>

            {/* Category and Urgency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-disaster-blue"
                >
                  <option value="Meals">Meals</option>
                  <option value="Water">Water</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Medical">Medical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency
                </label>
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-disaster-blue"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-disaster-blue"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-disaster-blue"
                />
              </div>
            </div>

            {/* Contact Sharing */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isContactShared"
                name="isContactShared"
                checked={formData.isContactShared}
                onChange={handleInputChange}
                className="h-4 w-4 text-disaster-blue focus:ring-disaster-blue border-gray-300 rounded"
              />
              <label htmlFor="isContactShared" className="ml-2 block text-sm text-gray-700">
                Share my contact info when someone claims this request
              </label>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gpsLat" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude (optional)
                </label>
                <input
                  type="number"
                  step="any"
                  id="gpsLat"
                  name="gpsLat"
                  value={formData.gpsLat}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-disaster-blue"
                  placeholder="33.7490"
                />
              </div>

              <div>
                <label htmlFor="gpsLng" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (optional)
                </label>
                <input
                  type="number"
                  step="any"
                  id="gpsLng"
                  name="gpsLng"
                  value={formData.gpsLng}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-disaster-blue"
                  placeholder="-84.3880"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label htmlFor="photos" className="block text-sm font-medium text-gray-700 mb-1">
                Photos (up to 5)
              </label>
              <input
                type="file"
                id="photos"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-disaster-blue"
              />
              <p className="text-xs text-gray-500 mt-1">
                Photos may contain GPS location data. By uploading, you consent to share this information.
              </p>
            </div>

            {/* Preview selected files */}
            {files.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                <ul className="text-sm text-gray-600">
                  {files.map((file, index) => (
                    <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 disaster-button-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 disaster-button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
