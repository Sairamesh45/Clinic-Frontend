// ShaderGradientLoader.jsx
// Helper component and instructions for integrating @shadergradient/react
// This file intentionally does not import @shadergradient/react to avoid build
// errors when the package is not installed. Follow the steps below to enable
// the live ShaderGradient background on the Login page.

/*
  Steps to enable ShaderGradient background:

  1) Install dependencies (Vite / npm):

     npm install @shadergradient/react @react-three/fiber three three-stdlib camera-controls
     npm i -D @types/three

     or with yarn:

     yarn add @shadergradient/react @react-three/fiber three three-stdlib camera-controls
     yarn add -D @types/three

  2) Set Vite env variable to enable the background (optional):

     Create a .env file with:
     VITE_SHADERGRADIENT=true

  3) Replace the placeholder render in `src/pages/LoginPage.jsx` with the
     `ShaderGradientLoader` component (see example below).

  Example usage (uncomment after installing packages):

    // import ShaderGradientLoader from '../components/ShaderGradientLoader'
    // <ShaderGradientLoader className="absolute inset-0 z-0" />

  4) The minimal integration below assumes you want the shader inside the left
     panel. For customization, pass props through to ShaderGradient/Canvas.
*/

import React from 'react'

export default function ShaderGradientLoader(props) {
  // This component is intentionally a placeholder. If you prefer, you can
  // replace this file's contents with a real import after installing
  // `@shadergradient/react` and then return the renderer. Example code:
  /*
  import React, { Suspense } from 'react'
  const ShaderGradientCanvas = React.lazy(() => import('@shadergradient/react').then(m => ({ default: m.ShaderGradientCanvas })))
  const ShaderGradient = React.lazy(() => import('@shadergradient/react').then(m => ({ default: m.ShaderGradient })))

  return (
    <Suspense fallback={null}>
      <ShaderGradientCanvas style={{ position: 'absolute', inset: 0 }} pixelDensity={1.3} fov={45}>
        <ShaderGradient cDistance={32} cPolarAngle={125} color1='#52ff89' color2='#dbba95' color3='#6ea8ff' />
      </ShaderGradientCanvas>
    </Suspense>
  )
  */

  // For now, render nothing so the app is safe when dependencies are missing.
  return null
}
