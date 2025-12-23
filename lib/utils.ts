import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path:string){
  if (typeof window !== 'undefined') return path;
  if(process.env.VERCEL_URL){
    return `https://${process.env.VERCEL_URL}${path}`
  }
  return `http://localhost:${process.env.PORT ?? 3000}${path}`
}

// export function constructMetadata({
//   title='Amaze',
//   description= 'Amaze is an open-source site which make chatting with your PDF'
//   image = '/thumbnail.png',
//   icons='/favicon.ico'
// })