<template lang="pug">
component(:is="'style'")
  | body { background-color: {{isBreakTime || showOptions ? '#004d40' : backgroundColor}}!important; }
  | body { animation: {{isBreakTime ? 'pulse 2s infinite !important' : 'none'}}; }
div(v-if="!showOptions")
  div.options-container
    button.options-button(@click="toggleOptions")
      i.fa.fa-cog
  h1 {{ displayTime }}
  b(:style="`color:${phase == 'Break' ? 'green' : ''}`") {{ phase }}
  input.task(type="text", placeholder="Your Task", v-model="task", style="margin: 10px 0")
  button(v-if="timerState != 'running' && isBreakTime", @click="startBreak") ▶️ Start Break
  button(v-else-if="timerState != 'running'", @click="backToWork") ▶️ Start Work
  button(v-else-if="!isBreakTime", @click="startBreak") ⏭️ Skip to Break
  button(v-else, @click="backToWork") ⏭️ Back to Work
  button(@click="toggleFunMode")
    span(style="font-size:20px; margin-right: 5px") {{ isFunMode ? '🤪' : '😴' }}
    | Fun {{ isFunMode ? 'On' : 'Off' }}
  .small-text BPM: {{ Math.floor(this.currentBPM) }}
div(v-if="showOptions")
  h1 Options
  .option
    label(for="mute") Mute:
    input(type="checkbox", id="mute", v-model="isMuted")
  .option
    label(for="volume") Volume:
    input(type="range", id="volume", v-model="volume", min="0", max="1", step="0.1")
  .option
    label(for="tickingSound") Ticking Sound:
    select(id="tickingSound", v-model="selectedTickingSound")
      option(value="bubbles") Bubbles
      option(value="fart") Fart
      option(value="tickTock") Tick tock
      option(value="cafeAmbience") Cafe ambience
      option(value="battlefield") Battlefield
      option(value="none") None
  .option
    label(for="workTime") Work Time (minutes):
    input(type="number", id="workTime", v-model="workDurationMinutes")
  .option
    label(for="breakTime") Break Time (minutes):
    input(type="number", id="breakTime", v-model="breakDurationMinutes")
  .option
    label(for="startingBpm") Color Change Rate (BPM):
    input(type="number", id="startingBpm", v-model="startingBPM")
  .option
    label(for="doVoices") Voice Countdown / Encouragements:
    input(type="checkbox", id="doVoices", v-model="doVoices")
  .option
    label(for="autoStartPhase") Auto-Start Each Phase:
    input(type="checkbox", id="autoStartPhase", v-model="autoStartPhase")
  button(@click="toggleOptions") Save
  .option
    //- Show Electron App Version
    .small-text Version: 1.0.3
    a.small-text(href="https://github.com/timsayshey/cringe-clock/releases", target="_blank") Check Updates
</template>
<script lang="ts">
export default {
  data() {
    return {
      countdownAudios: {
        5: new Audio('https://outerplex.com/cringeclock/audio/countdown/001.wav'), // 10 seconds
        20: new Audio('https://outerplex.com/cringeclock/audio/countdown/002.wav'), // 20 seconds
        30: new Audio('https://outerplex.com/cringeclock/audio/countdown/003.wav'), // 30 seconds
        40: new Audio('https://outerplex.com/cringeclock/audio/countdown/004.wav'), // 40 seconds
        50: new Audio('https://outerplex.com/cringeclock/audio/countdown/005.wav'), // 50 seconds
        60: new Audio('https://outerplex.com/cringeclock/audio/countdown/006.wav'), // 1 minutes remaining
        90: new Audio('https://outerplex.com/cringeclock/audio/encouragements/1%20-%20Swing%20big%20home%202.wav'),
        120: new Audio('https://outerplex.com/cringeclock/audio/countdown/007.wav'), // 2 minutes remaining
        150: new Audio('https://outerplex.com/cringeclock/audio/encouragements/2%20-%20Sparkle%20up%20sta%201.wav'),
        180: new Audio('https://outerplex.com/cringeclock/audio/countdown/008.wav'), // 3 minutes remaining
        200: new Audio('https://outerplex.com/cringeclock/audio/encouragements/3%20-%20Sprint%20it%20out%202.wav'),
        240: new Audio('https://outerplex.com/cringeclock/audio/countdown/009.wav'), // 4 minutes remaining
        280: new Audio('https://outerplex.com/cringeclock/audio/encouragements/4%20-%20Ignite%20the%20fire%201.wav'),
        300: new Audio('https://outerplex.com/cringeclock/audio/countdown/010.wav'), // 5 minutes remaining
        400: new Audio('https://outerplex.com/cringeclock/audio/encouragements/5%20-%20Glide%20high%20eag%201.wav'),
        500: new Audio('https://outerplex.com/cringeclock/audio/encouragements/6%20-%20Bust%20moves%20dan%201.wav'),
        595: new Audio('https://outerplex.com/cringeclock/audio/encouragements/7%20-%20Roar%20loud%20jung%201.wav'),
      } as Record<number, HTMLAudioElement>,
      isBreakTime: false,
      tickingAudio: new Audio('https://outerplex.com/cringeclock/audio/effects/pop-39222.mp3'),
      breakendAudio: new Audio('https://outerplex.com/cringeclock/audio/effects/8e8118_counter_strike_go_go_go_sound_effect.mp3'),
      workendAudio: new Audio('https://outerplex.com/cringeclock/audio/effects/success-1-6297.mp3'),
      timeLeft: 0,
      timer: null as any,
      timerState: 'idle', // 'idle', 'running', 'paused', 'onBreak'
      completedPomodoros: 0,
      flashingInterval: null as number | null,
      isFunMode: false,
      backgroundColor: '',
      currentBPM: 60,
      showOptions: false,
      task: '',
      isMuted: false,
      doVoices: true,
      startingBPM: 60,
      selectedTickingSound: 'bubbles',
      volume: 0.2,
      autoStartPhase: true,
      workDurationMinutes: 25, // Default 25 minutes
      breakDurationMinutes: 5, // Default 5 minutes
      tickingSounds: {
        'bubbles': 'https://outerplex.com/cringeclock/audio/effects/pop-39222.mp3',
        'fart': 'https://outerplex.com/cringeclock/audio/effects/086424_small-realpoot106wav-37403.mp3',
        'tickTock': 'https://outerplex.com/cringeclock/audio/effects/ticking-clock_1-27477.mp3',
        'cafeAmbience': 'https://outerplex.com/cringeclock/audio/effects/cafe-ambience-9263.mp3',
        'battlefield': 'https://outerplex.com/cringeclock/audio/effects/modern-war-129016.mp3',
        'none': '',
      } as Record<string, string>
    };
  },
  computed: {
    phase() {
      return this.isBreakTime ? 'Break' : 'Work';
    },
    displayTime() {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
  },
  created() {
    this.loadOptions();
  },
  mounted() {
    if (this.isFunMode) {
      this.startFunMode();
      this.playTickingSound();
    }
  },
  methods: {
    playCountdownAudio(timeLeft: number) {
      if (this.doVoices && this.countdownAudios[timeLeft] && !this.isMuted && this.isFunMode && !this.isBreakTime) {
        this.countdownAudios[timeLeft].volume = this.volume;
        this.countdownAudios[timeLeft].play();
      }
    },
    saveOptions() {
      const whitelist = ['autoStartPhase', 'isFunMode', 'task', 'isMuted', 'volume', 'selectedTickingSound', 'workDurationMinutes', 'breakDurationMinutes', 'startingBPM']; // Add serializable and necessary properties here
      const dataToSave = {} as Record<string, any>;
      whitelist.forEach(key => {
        dataToSave[key] = (this as any)[key];
      });
      localStorage.setItem('appData', JSON.stringify(dataToSave));
    },
    loadOptions() {
      const savedData = localStorage.getItem('appData');
      if (savedData) {
        const data = JSON.parse(savedData);
        Object.assign(this, data);
      }
    },
    toggleOptions() {
      this.showOptions = !this.showOptions;
      if (!this.showOptions) {
        this.saveOptions();
      }
    },
    startTimer(isBreakTime: boolean = false) {
      this.isBreakTime = isBreakTime;
      clearInterval(this.timer);
      this.timerState = 'running';
      this.timeLeft = isBreakTime ? this.breakDurationMinutes * 60 : this.workDurationMinutes * 60;
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          // Play countdown audio at specific times
          const countdownTimes = Object.keys(this.countdownAudios).map(time => parseInt(time))
          if (countdownTimes.includes(this.timeLeft)) {
            this.playCountdownAudio(this.timeLeft);
          }
        } else {
          this.completeInterval();
        }
      }, 1000);
      if(this.isFunMode && !this.isBreakTime) {
        this.playTickingSound();
      }
    },
    completeInterval() {
      this.stopTickingSound();
      clearInterval(this.timer);
      this.timer = null;
      this.playEndSound();

      // Transition to the next phase, but don't start the timer automatically
      if (!this.autoStartPhase) {
        this.isBreakTime = !this.isBreakTime; // Toggle the phase
        this.timerState = 'idle'; // Set the timer state to idle
      } else {
        // If autoStartPhase is enabled, automatically start the next phase
        if (this.isBreakTime) {
          // Transition from break to work
          this.isBreakTime = false;
          this.startTimer(false); // Start work timer
        } else {
          // Transition from work to break
          this.isBreakTime = true;
          this.startTimer(true); // Start break timer
        }
      }
    },
    startBreak() {
      this.stopTickingSound();
      this.isBreakTime = true;
      this.timeLeft = this.breakDurationMinutes * 60;
      this.timerState = 'onBreak';
      this.startTimer(true);
    },
    backToWork() {
      this.currentBPM = this.startingBPM;
      this.isBreakTime = false;
      this.timeLeft = this.workDurationMinutes * 60;
      this.startTimer(false);
    },
    stopTickingSound() {
      this.tickingAudio.pause();
      this.tickingAudio.currentTime = 0;
    },
    startFunMode() {
      clearInterval(this.flashingInterval as number);
      this.currentBPM = this.startingBPM; // Start with this.startingBPM bpm
      const minBPM = 60; // Slow down to 60 bpm
      const totalDecrementTime = this.workDurationMinutes * 60; // Total time for decrement in seconds (25 minutes)
      const decrementStep = 10; // Update interval in seconds
      const totalSteps = totalDecrementTime / decrementStep;
      const decrement = (this.currentBPM - minBPM) / totalSteps; // Calculate BPM decrement per step (should be 0.6)

      const updateColor = () => {
        this.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        const colorChangeInterval = 60000 / this.currentBPM / 2; // Interval based on current BPM
        this.flashingInterval = setTimeout(updateColor, colorChangeInterval);
      };

      const updateBPM = () => {
        if (this.currentBPM > minBPM) {
          this.currentBPM = Math.max(this.currentBPM - decrement, minBPM); // Decrease BPM
        }
        setTimeout(updateBPM, decrementStep * 1000); // Update BPM every decrementStep seconds
      };

      updateColor(); // Start updating the color immediately
      updateBPM(); // Start updating the BPM
      this.isFunMode = true;
    },
    stopFunMode() {
      clearInterval(this.flashingInterval as number);
      this.backgroundColor = '';
      this.isFunMode = false;
    },
    toggleFunMode() {
      if (this.isFunMode) {
        this.stopFunMode();
        this.stopTickingSound();
      } else {
        this.startFunMode();
        this.playTickingSound();
      }
    },
    stopTimer() {
      clearInterval(this.timer);
      this.timer = null;
      this.timerState = 'paused';
      this.stopTickingSound();
    },
    playTickingSound() {
      if(this.isMuted) return;
      this.tickingAudio.volume = this.volume;
      this.tickingAudio.loop = true;
      this.tickingAudio.play();
    },
    playEndSound() {
      if (this.isMuted) return;
      if (this.isFunMode) {
        const audio = this.isBreakTime ? this.breakendAudio : this.workendAudio;
        audio.volume = this.volume; // Use the volume data property
        audio.play();
      }
    },
  },
  watch: {
    isFunMode() {
      this.saveOptions();
    },
    task() {
      this.saveOptions();
    },
    volume(newVolume) {
      this.tickingAudio.volume = newVolume;
    },
    startingBPM() {
      this.currentBPM = this.startingBPM;
    },
    selectedTickingSound(newSound) {
      if (this.tickingAudio && !this.tickingAudio.paused) {
        this.stopTickingSound(); // Stop the currently playing sound
      }
      this.tickingAudio = new Audio(this.tickingSounds[newSound]);
      if (this.isFunMode && !this.isBreakTime && !this.isMuted) {
        this.playTickingSound(); // Play the new sound
      }
    },
    isMuted() {
      if(!this.isMuted && this.isFunMode && !this.isBreakTime) {
        this.playTickingSound();
      } else {
        this.stopTickingSound();
      }
    }
  }
};
</script>

<style>
.option {
  margin-bottom: 10px;
  font-size: 12px;
}
h1 {
  margin: 0;
  font-size: 25px;
}
button {
  width: 100%
}
body, div, input, button {
  font-size: 15px;
}
body {
  padding: 0;
  margin: 10px 20px;
  color: #ebebeba3;
  background: #202020;
  line-height: 1.6;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  font-size: 15px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
h1, div, p {
  color: white;
}
input[type="text"], input[type="number"], input[type="range"], select {
  width: 100%;
  background: none;
  border: 0;
  border-bottom: 2px solid #ebebeba3;
  color: white;
  cursor:text;
}
.task:focus {
  outline: none;
}
button {
  background-color: white;
  color: black;
  border: 2px solid black;
  border-radius: 10px;
  padding: 2px 5px;
  margin-bottom: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}
.small-text {
  font-size: 10px
}
button:hover {
  background-color: black;
  color: white;
}

a {
  color:rgb(34, 178, 255)
}

.options-container {
  position: fixed;
  top: 15px;
  right: 10px;
  z-index: 10;
}

.options-button {
  background: none;
  border: none;
  cursor: pointer;
}

.options-button .fa-cog {
  color: rgba(255, 255, 255, 0.767);
  font-size: 15px; /* Adjust size as needed */
}
.options-button .fa-cog:hover {
  color: white;
}
@keyframes pulse {
  0% {
    background-color: #ffffff; /* initial color */
  }
  50% {
    background-color: #009688; /* mid-transition color */
  }
  100% {
    background-color: #004d40; /* final color */
  }
}

body.pulsing-background {
  animation: pulse 5s infinite;
}
</style>

