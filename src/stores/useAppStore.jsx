import { create } from "zustand"
import { persist } from "zustand/middleware"
import { sounds } from "../config/sounds"

// Create initial volumes object from sounds config
const initialVolumes = sounds.reduce((acc, sound) => {
  acc[`${sound.id}Volume`] = 1
  return acc
}, {})

const useAppStore = create(
  persist(
    (set) => ({
      ...initialVolumes,
      setVolume: (soundId, volume) => 
        set({ [`${soundId}Volume`]: volume }),
    }),
    {
      name: 'audio-settings',
    }
  )
)

export default useAppStore