<template lang="pug">
component(:is="'style'")
  | body { background-color: {{isBreakTime ? '' : backgroundColor}}!important; }
div
  h1(style="margin:0") {{ displayTime }}
  b(:style="`color:${phase == 'Break' ? 'green' : ''}`") {{ phase }}
  input.task(type="text", placeholder="Task", style="margin: 10px 0")
  button(v-if="timerState != 'running' && isBreakTime", @click="startBreak") ▶️ Start Break
  button(v-else-if="timerState != 'running'", @click="backToWork") ▶️ Start Work
  button(v-else-if="!isBreakTime", @click="startBreak") ⏭️ Skip to Break
  button(v-else, @click="backToWork") ⏭️ Back to Work
  button(@click="toggleFlashing") 🤪 Cringe {{ isFlashing ? 'On' : 'Off'}}
</template>

<script lang="ts">
export default {
  data() {
    return {
      isBreakTime: false,
      tickingAudio: new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_dbb9bd8504.mp3?filename=pop-39222.mp3'),
      breakendAudio: new Audio('https://www.myinstants.com/media/sounds/8e8118_counter_strike_go_go_go_sound_effect.mp3'),
      workendAudio: new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3'),
      workDuration: 25 * 60, // 25 minutes
      breakDuration: 5 * 60, // 5 minutes
      timeLeft: 0,
      timer: null as any,
      timerState: 'idle', // 'idle', 'running', 'paused', 'onBreak'
      completedPomodoros: 0,
      flashingInterval: null as number | null,
      isFlashing: false,
      backgroundColor: '',
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
  methods: {
    startTimer(isBreakTime: boolean = false) {
      this.isBreakTime = isBreakTime;
      clearInterval(this.timer);
      this.timerState = 'running';
      this.timeLeft = isBreakTime ? this.breakDuration : this.workDuration;
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.completeInterval();
        }
      }, 1000);
      if(this.isFlashing && !this.isBreakTime) {
        this.playTickingSound();
      }
    },
    completeInterval() {
      this.stopTickingSound();
      clearInterval(this.timer);
      this.timer = null;
      this.playEndSound();
      if (this.isBreakTime) {
        // If break time has just ended
        this.timerState = 'idle'; // Change state to idle instead of immediately starting work
        this.isBreakTime = false; // Set isBreakTime to false, indicating break is over
      } else {
        // If work time has just ended
        this.timerState = 'onBreak'; // Change state to onBreak instead of immediately starting break
        this.isBreakTime = true; // Set isBreakTime to true, indicating work is over and it's time for a break
      }
    },
    startBreak() {
      this.stopTickingSound();
      this.isBreakTime = true;
      this.timeLeft = this.breakDuration;
      this.timerState = 'onBreak';
      this.startTimer(true);
    },
    backToWork() {
      this.isBreakTime = false;
      this.timeLeft = this.workDuration;
      this.startTimer(false);
    },
    stopTickingSound() {
      this.tickingAudio.pause();
      this.tickingAudio.currentTime = 0;
    },
    startFlashing() {
      clearInterval(this.flashingInterval as number);
      this.flashingInterval = setInterval(() => {
        this.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      }, 1000); // Change color every 500ms
      this.isFlashing = true;
    },
    stopFlashing() {
      clearInterval(this.flashingInterval as number);
      this.backgroundColor = '';
      this.isFlashing = false;
    },
    toggleFlashing() {
      if (this.isFlashing) {
        this.stopFlashing();
        this.stopTickingSound();
      } else {
        this.startFlashing();
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
      this.tickingAudio.volume = 0.2;
      this.tickingAudio.loop = true;
      this.tickingAudio.play();
    },
    playEndSound() {
      if(this.isFlashing) {
        const audio = this.isBreakTime ? this.breakendAudio : this.workendAudio;
        audio.volume = 0.2;
        this.tickingAudio.loop = true;
        audio.play();
      }
    },
  },
};
</script>

<style>
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
.task {
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
  margin: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

button:hover {
  background-color: black;
  color: white;
}

/* Example for a play icon button */
.button-play::before {
  content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="18px" height="18px"><path d="M8 5v14l11-7z"/></svg>');
  margin-right: 5px;
}

/* Add similar classes for other icons as needed */
</style>

