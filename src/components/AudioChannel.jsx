import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function AudioChannel({ 
  icon, 
  isPlaying, 
  onToggle, 
  volume, 
  onVolumeChange, 
  audio 
}) {
  return (
    <div className={`aspect-square card bg-base-100 shadow hover:shadow-lg transition-all ${isPlaying ? 'ring-2 ring-primary' : ''}`}>
      <div className="card-body p-0">
        <button 
          onClick={onToggle}
          className="w-full h-full btn btn-ghost btn-sm hover:bg-transparent flex items-center justify-center"
        >
          <FontAwesomeIcon 
            icon={icon} 
            className={`text-2xl ${isPlaying ? 'text-primary' : 'text-base-content'}`} 
          />
        </button>
      </div>
    </div>
  );
}

export default AudioChannel; 