import { parse } from 'exifr';

export async function extractImageMetadata(file: File) {
  try {
    const exif: any = await parse(file, { 
      gps: true, 
      tiff: true,
      exif: true 
    });
    
    return {
      latitude:  exif?.latitude  || null,
      longitude: exif?.longitude || null,
      timestamp: exif?.DateTimeOriginal || null,
      device:    exif?.Make ? `${exif.Make} ${exif.Model}` : null,
      hasGps:    !!(exif?.latitude && exif?.longitude)
    };
  } catch (error) {
    console.error('EXIF extraction failed:', error);
    return { latitude: null, longitude: null, timestamp: null, device: null, hasGps: false };
  }
}
