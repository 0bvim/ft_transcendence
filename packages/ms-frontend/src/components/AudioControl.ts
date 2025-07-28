export class AudioControl {
  private audioElement: HTMLAudioElement | null = null;
  private container: HTMLElement;
  private isPlaying: boolean = false;
  private isMuted: boolean = true; // Start muted
  private hasAudioFile: boolean = false;

  constructor() {
    this.container = this.createAudioControl();
    this.initializeAudio();
    
    // Expose for debugging
    (window as any).audioControl = this;
  }

  // Simple test function for debugging
  public async testAudioFile(): Promise<void> {
    const audioSrc = '/assets/audio/synthwave-background.mp3';
    
    console.log('🎵 TEST: Testing audio file step by step...');
    
    // Step 1: Test if file exists via fetch
    console.log('🎵 TEST: Step 1 - Testing file existence with fetch...');
    try {
      const response = await fetch(audioSrc);
      console.log(`🎵 TEST: Fetch response - Status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
      
      if (response.ok) {
        console.log('🎵 TEST: ✅ File exists and is accessible');
      } else {
        console.log('🎵 TEST: ❌ File not accessible via fetch');
        return;
      }
    } catch (error) {
      console.log('🎵 TEST: ❌ Fetch failed:', error);
      return;
    }
    
    // Step 2: Test direct audio element creation
    console.log('🎵 TEST: Step 2 - Testing direct audio element...');
    const testAudio = new Audio();
    testAudio.src = audioSrc;
    
    testAudio.addEventListener('loadstart', () => console.log('🎵 TEST: loadstart event'));
    testAudio.addEventListener('loadedmetadata', () => console.log('🎵 TEST: loadedmetadata event'));
    testAudio.addEventListener('loadeddata', () => console.log('🎵 TEST: loadeddata event'));
    testAudio.addEventListener('canplay', () => console.log('🎵 TEST: canplay event'));
    testAudio.addEventListener('canplaythrough', () => console.log('🎵 TEST: ✅ canplaythrough event - Audio is ready!'));
    testAudio.addEventListener('error', (e) => console.log('🎵 TEST: ❌ Audio error:', e));
    
    try {
      testAudio.load();
      console.log('🎵 TEST: Audio load() called successfully');
    } catch (error) {
      console.log('🎵 TEST: ❌ Audio load() failed:', error);
    }
    
    // Step 3: Test play (requires user interaction)
    console.log('🎵 TEST: Step 3 - To test play, manually call: window.audioControl.testPlay()');
  }
  
  public async testPlay(): Promise<void> {
    const audioSrc = '/assets/audio/synthwave-background.mp3';
    const testAudio = new Audio(audioSrc);
    
    console.log('🎵 TEST: Attempting to play audio...');
    
    try {
      await testAudio.play();
      console.log('🎵 TEST: ✅ Audio playing successfully!');
      
      setTimeout(() => {
        testAudio.pause();
        console.log('🎵 TEST: Audio stopped');
      }, 2000);
      
    } catch (error) {
      console.log('🎵 TEST: ❌ Play failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          console.log('🎵 TEST: Browser autoplay policy blocked audio. This is normal - user interaction required.');
        } else if (error.name === 'NotSupportedError') {
          console.log('🎵 TEST: Audio format not supported by browser');
        }
      }
    }
  }

  private createAudioControl(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'audio-control group';
    
    container.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="relative flex items-center justify-center w-6 h-6">
          <!-- Audio Icon -->
          <svg class="audio-icon-speaker w-6 h-6 text-neon-cyan transition-colors duration-300 group-hover:text-neon-pink" 
               fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          
          <!-- Muted Icon (shown by default) -->
          <div class="audio-icon-muted absolute inset-0 flex items-center justify-center">
            <!-- Speaker base (same as above but in muted color) -->
            <svg class="w-6 h-6 text-danger-400 absolute" 
                 fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3z"/>
            </svg>
            <!-- X overlay perfectly centered -->
            <svg class="w-6 h-6 text-danger-500 absolute" 
                 fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </div>
        </div>
        
        <!-- Status Text -->
        <span class="text-xs font-mono text-neon-cyan uppercase tracking-wider audio-status">
          Music
        </span>
        
        <!-- Pulse Animation -->
        <div class="audio-pulse w-2 h-2 bg-neon-cyan rounded-full hidden animate-pulse">
        </div>
      </div>
      
      <!-- Tooltip -->
      <div class="absolute bottom-full right-0 mb-2 px-3 py-1 bg-secondary-900/90 backdrop-blur-lg border border-neon-pink/30 text-xs text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap clip-cyber-button">
        <span class="tooltip-text">Click to toggle music</span>
      </div>
    `;

    // Add click event listener
    container.addEventListener('click', () => {
      this.toggleAudio();
    });

    return container;
  }

  private async initializeAudio(): Promise<void> {
    try {
      console.log('🎵 AudioControl: Initializing audio...');
      
      // Create audio element
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.volume = 0.3; // Set to 30% volume
      this.audioElement.preload = 'auto';
      
      // In Vite, files in public/ are served from root path
      // So public/assets/audio/file.mp3 becomes /assets/audio/file.mp3
      const audioSrc = '/assets/audio/synthwave-background.mp3';
      
      console.log('🎵 AudioControl: Loading audio from:', audioSrc);
      
      try {
        // Test if the file exists by making a HEAD request
        const response = await fetch(audioSrc, { method: 'HEAD' });
        if (!response.ok) {
          console.log(`🎵 AudioControl: File not found at ${audioSrc} (${response.status})`);
          this.updateStatus('Not Found');
          this.hasAudioFile = false;
          return;
        }
        
        console.log(`🎵 AudioControl: File found at ${audioSrc}, loading...`);
        
        // Set the audio source
        this.audioElement.src = audioSrc;
        
        // Wait for the audio to be ready
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Audio load timeout'));
          }, 5000);
          
          this.audioElement!.addEventListener('canplaythrough', () => {
            clearTimeout(timeout);
            resolve(true);
          }, { once: true });
          
          this.audioElement!.addEventListener('error', (e) => {
            clearTimeout(timeout);
            console.error(`🎵 AudioControl: Audio error for ${audioSrc}:`, e);
            reject(e);
          }, { once: true });
          
          this.audioElement!.load();
        });
        
        this.hasAudioFile = true;
        console.log(`🎵 AudioControl: Successfully loaded audio from ${audioSrc}`);
        
      } catch (error) {
        console.log(`🎵 AudioControl: Failed to load ${audioSrc}:`, error);
        this.updateStatus('Not Found');
        this.hasAudioFile = false;
        return;
      }
      
      // Handle audio events
      this.audioElement.addEventListener('canplaythrough', () => {
        console.log('🎵 AudioControl: Audio ready to play');
        this.updateStatus('Ready');
        this.hasAudioFile = true;
      });
      
      this.audioElement.addEventListener('error', (e) => {
        console.error('🎵 AudioControl: Audio error:', e);
        this.updateStatus('Error');
        this.hasAudioFile = false;
      });
      
      this.audioElement.addEventListener('play', () => {
        console.log('🎵 AudioControl: Audio started playing');
        this.isPlaying = true;
        this.updateUI();
      });
      
      this.audioElement.addEventListener('pause', () => {
        console.log('🎵 AudioControl: Audio paused');
        this.isPlaying = false;
        this.updateUI();
      });

      this.updateStatus('Ready');

    } catch (error) {
      console.error('🎵 AudioControl: Initialization failed:', error);
      this.updateStatus('Error');
      this.hasAudioFile = false;
    }
  }

  private toggleAudio(): void {
    console.log('🎵 AudioControl: Toggle clicked, hasAudioFile:', this.hasAudioFile, 'isPlaying:', this.isPlaying, 'isMuted:', this.isMuted);
    
    if (!this.hasAudioFile) {
      console.log('🎵 AudioControl: No audio file available');
      this.updateStatus('No Audio');
      
      // Try to reinitialize audio
      console.log('🎵 AudioControl: Attempting to reinitialize audio...');
      this.initializeAudio();
      return;
    }
    
    if (!this.audioElement) {
      console.log('🎵 AudioControl: No audio element');
      return;
    }

    if (this.isMuted || !this.isPlaying) {
      this.playAudio();
    } else {
      this.muteAudio();
    }
  }

  private async playAudio(): Promise<void> {
    if (!this.audioElement || !this.hasAudioFile) {
      console.log('🎵 AudioControl: Cannot play - no audio element or file');
      return;
    }

    try {
      console.log('🎵 AudioControl: Attempting to play audio...');
      
      // Modern browsers require user interaction to play audio
      const playPromise = this.audioElement.play();
      
      if (playPromise !== undefined) {
        await playPromise;
      }
      
      this.isMuted = false;
      this.isPlaying = true;
      this.updateUI();
      this.updateStatus('Playing');
      console.log('🎵 AudioControl: Audio playing successfully');
      
    } catch (error: any) {
      console.error('🎵 AudioControl: Play failed:', error);
      
      if (error.name === 'NotAllowedError') {
        this.updateStatus('Click Again');
        console.log('🎵 AudioControl: Browser requires user interaction, user needs to click again');
      } else {
        this.updateStatus('Error');
      }
    }
  }

  private muteAudio(): void {
    if (!this.audioElement) return;

    console.log('🎵 AudioControl: Muting audio');
    this.audioElement.pause();
    this.isMuted = true;
    this.isPlaying = false;
    this.updateUI();
    this.updateStatus('Muted');
  }

  private updateUI(): void {
    const speakerIcon = this.container.querySelector('.audio-icon-speaker') as HTMLElement;
    const mutedIcon = this.container.querySelector('.audio-icon-muted') as HTMLElement;
    const pulse = this.container.querySelector('.audio-pulse') as HTMLElement;

    if (this.isPlaying && !this.isMuted && this.hasAudioFile) {
      // Playing state
      this.container.classList.remove('muted');
      speakerIcon?.classList.remove('hidden');
      mutedIcon?.classList.add('hidden');
      pulse?.classList.remove('hidden');
    } else {
      // Muted/paused state
      this.container.classList.add('muted');
      speakerIcon?.classList.add('hidden');
      mutedIcon?.classList.remove('hidden');
      pulse?.classList.add('hidden');
    }
  }

  private updateStatus(text: string): void {
    const status = this.container.querySelector('.audio-status') as HTMLElement;
    if (status) {
      status.textContent = text;
    }
    
    const tooltip = this.container.querySelector('.tooltip-text') as HTMLElement;
    if (tooltip) {
      switch (text) {
        case 'Ready':
        case 'Playing':
        case 'Muted':
          tooltip.textContent = 'Click to toggle music';
          break;
        case 'Click Again':
          tooltip.textContent = 'Browser requires interaction - click again';
          break;
        case 'Not Found':
          tooltip.textContent = 'Audio file not found';
          break;
        case 'Error':
          tooltip.textContent = 'Audio error occurred';
          break;
        default:
          tooltip.textContent = 'Click to toggle music';
      }
    }
  }

  public mount(parentElement: HTMLElement): void {
    parentElement.appendChild(this.container);
  }

  public unmount(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    this.container.remove();
  }

  // Public methods for external control
  public setVolume(volume: number): void {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  public getVolume(): number {
    return this.audioElement?.volume || 0;
  }

  public setAudioSource(src: string): void {
    console.log('🎵 AudioControl: Setting new audio source:', src);
    if (this.audioElement) {
      this.audioElement.src = src;
      this.hasAudioFile = true;
      this.updateStatus('Ready');
    }
  }

  // Debug method to check file availability
  public async checkAudioFile(): Promise<void> {
    const audioSrc = '/assets/audio/synthwave-background.mp3';
    
    console.log('🎵 AudioControl: Checking audio file availability...');
    
    try {
      const response = await fetch(audioSrc, { method: 'HEAD' });
      console.log(`🎵 AudioControl: ${audioSrc} - Status: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`🎵 AudioControl: ${audioSrc} - Error:`, error);
    }
  }
} 