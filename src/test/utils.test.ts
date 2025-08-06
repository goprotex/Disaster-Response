import { describe, it, expect } from 'vitest'
import { 
  validateImageFiles, 
  getUrgencyWeight, 
  getBestLocation 
} from '@/lib/utils'

describe('Utils', () => {
  describe('validateImageFiles', () => {
    it('should return error for no files', () => {
      const errors = validateImageFiles([])
      expect(errors).toContain('No files selected')
    })

    it('should return error for too many files', () => {
      const files = Array(6).fill(new File([''], 'test.jpg', { type: 'image/jpeg' }))
      const errors = validateImageFiles(files)
      expect(errors).toContain('Maximum 5 images allowed')
    })

    it('should return error for non-image files', () => {
      const files = [new File([''], 'test.txt', { type: 'text/plain' })]
      const errors = validateImageFiles(files)
      expect(errors).toContain('File 1 (test.txt) is not an image')
    })
  })

  describe('getUrgencyWeight', () => {
    it('should return correct weights for urgency levels', () => {
      expect(getUrgencyWeight('High')).toBe(1.0)
      expect(getUrgencyWeight('Medium')).toBe(0.6)
      expect(getUrgencyWeight('Low')).toBe(0.3)
    })
  })

  describe('getBestLocation', () => {
    it('should prefer user location over EXIF', () => {
      const exifData = [{ latitude: 33.0, longitude: -84.0 }]
      const result = getBestLocation(exifData, 34.0, -85.0)
      expect(result).toEqual({ lat: 34.0, lng: -85.0 })
    })

    it('should use EXIF location when no user location', () => {
      const exifData = [{ latitude: 33.0, longitude: -84.0 }]
      const result = getBestLocation(exifData)
      expect(result).toEqual({ lat: 33.0, lng: -84.0 })
    })

    it('should return null when no location available', () => {
      const result = getBestLocation([])
      expect(result).toBeNull()
    })
  })
})
