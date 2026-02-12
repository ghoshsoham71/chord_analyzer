import '@/styles/globals.css'
import '@/styles/theme.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Chord Analyzer — Magical Audio Experience</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Analyze chords, visualize harmonics, and explore the magical world of music" />
        <meta name="theme-color" content="#0E0E0E" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Premium Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      <div className="noise-overlay" />
      <div className="vignette" />
      <Component {...pageProps} />
    </>
  )
}
