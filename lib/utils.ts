import { clsx, type ClassValue } from "clsx"
import { Metadata } from "next";
import { StringDecoder } from "string_decoder";
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

export function constructMetadata({
  title='Amaze',
  description= 'Amaze is an open-source site which make chatting with your PDF',
  image = '/thumbnail.png',
  icons='/favicon.ico',
  noIndex = false,
}:{
  title?: string 
  description?: string 
  image ?: string 
  icons?: string 
  noIndex?: boolean
}={}): Metadata{
  return {
    title,
    description,
    openGraph:{
      title,
      description,
      images:[
        {
          url:image
        }
      ]
    },
    twitter:{
      card: 'summary_large_image',
      title,
      description,
      images:[image],
      creator:'@mohammedihsaan',
    },
    icons,
    metadataBase: new URL(`https://amazer.vercel.app`),
    themeColor:'#FFF',
    ...(noIndex && {
      robots:{
        index:false,
        follow:false,
      }
    })
  }
}