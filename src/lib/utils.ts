import EXIF from 'exif-js'
import imageCompression from 'browser-image-compression'

export interface ExifData {
  latitude?: number
  longitude?: number
  dateTime?: string
  camera?: string
  [key: string]: any
}

// Convert DMS (Degrees, Minutes, Seconds) to decimal degrees
function dmsToDecimal(dms: number[], ref: string): number {
  let decimal = dms[0] + dms[1] / 60 + dms[2] / 3600
  if (ref === 'S' || ref === 'W') {
    decimal = decimal * -1
  }
  return decimal
}

// Extract GPS and other metadata from image EXIF data
export function extractExifData(file: File): Promise<ExifData> {
  return new Promise((resolve) => {
    EXIF.getData(file as any, function(this: any) {
      const lat = EXIF.getTag(this, 'GPSLatitude')
      const latRef = EXIF.getTag(this, 'GPSLatitudeRef')
      const lng = EXIF.getTag(this, 'GPSLongitude')
      const lngRef = EXIF.getTag(this, 'GPSLongitudeRef')
      const dateTime = EXIF.getTag(this, 'DateTimeOriginal') || EXIF.getTag(this, 'DateTime')
      const camera = EXIF.getTag(this, 'Model')

      const exifData: ExifData = {}

      // Extract GPS coordinates if available
      if (lat && latRef && lng && lngRef) {
        exifData.latitude = dmsToDecimal(lat, latRef)
        exifData.longitude = dmsToDecimal(lng, lngRef)
      }

      // Extract date/time
      if (dateTime) {
        exifData.dateTime = dateTime
      }

      // Extract camera model
      if (camera) {
        exifData.camera = camera
      }

      // Add all EXIF tags for debugging/analysis
      const allTags = EXIF.getAllTags(this)
      Object.assign(exifData, allTags)

      resolve(exifData)
    })
  })
}

// Compress image if it's too large
export async function compressImage(file: File, maxSizeMB: number = 5): Promise<File> {
  const options = {
    maxSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    preserveExif: true, // Keep EXIF data during compression
  }

  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    return file // Return original if compression fails
  }
}

// Process multiple images: extract EXIF and compress
export async function processImages(files: FileList | File[]): Promise<{
  file: File
  exifData: ExifData
}[]> {
  const fileArray = Array.from(files)
  
  const processedFiles = await Promise.all(
    fileArray.map(async (file) => {
      // Only process image files
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} is not an image`)
      }

      // Extract EXIF data before compression (to preserve original data)
      const exifData = await extractExifData(file)
      
      // Compress if needed
      const compressedFile = await compressImage(file)

      return {
        file: compressedFile,
        exifData,
      }
    })
  )

  return processedFiles
}

// Get best location from EXIF data or user input
export function getBestLocation(
  exifData: ExifData[], 
  userLat?: number, 
  userLng?: number
): { lat: number; lng: number } | null {
  // First try user-provided location
  if (userLat && userLng) {
    return { lat: userLat, lng: userLng }
  }

  // Then try EXIF GPS data from the first image with coordinates
  for (const exif of exifData) {
    if (exif.latitude && exif.longitude) {
      return { lat: exif.latitude, lng: exif.longitude }
    }
  }

  return null
}

// Validate image files
export function validateImageFiles(files: FileList | File[]): string[] {
  const errors: string[] = []
  const fileArray = Array.from(files)

  if (fileArray.length === 0) {
    errors.push('No files selected')
    return errors
  }

  if (fileArray.length > 5) {
    errors.push('Maximum 5 images allowed')
  }

  fileArray.forEach((file, index) => {
    if (!file.type.startsWith('image/')) {
      errors.push(`File ${index + 1} (${file.name}) is not an image`)
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      errors.push(`File ${index + 1} (${file.name}) is too large (>50MB)`)
    }
  })

  return errors
}

// Calculate urgency weight for heatmap
export function getUrgencyWeight(urgency: 'Low' | 'Medium' | 'High'): number {
  switch (urgency) {
    case 'High': return 1.0
    case 'Medium': return 0.6
    case 'Low': return 0.3
    default: return 0.3
  }
}
