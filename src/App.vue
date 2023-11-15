<template lang="pug">
component(:is="'style'")
  | body { background-color: {{isBreakTime ? '' : backgroundColor}}!important; }
div
  h1 {{ displayTime }}
  p {{ phase }}
  button(v-if="timerState === 'idle' || timerState === 'paused'", @click="startTimer") ▶️ Start
  button(v-if="timerState === 'running'", @click="stopTimer") ⏹️ Stop
  button(v-if="!isBreakTime", @click="startBreak") ⏭️ Skip to Break
  button(@click="toggleFlashing") 🤪 Cringe {{ isFlashing ? 'On' : 'Off'}}
</template>

<script>
export default {
  data() {
    return {
      isBreakTime: false,
      audio: new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_dbb9bd8504.mp3?filename=pop-39222.mp3'),
      workDuration: 25 * 60, // 25 minutes
      breakDuration: 5 * 60, // 5 minutes
      timeLeft: 0,
      timer: null,
      timerState: 'idle', // 'idle', 'running', 'paused', 'onBreak'
      completedPomodoros: 0,
      flashingInterval: null,
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
    startBreak() {
      this.isBreakTime = true;
      this.timeLeft = this.breakDuration;
      this.stopSound();
    },
    playSound() {
      this.audio.volume = 0.2;
      this.audio.loop = true;
      this.audio.play();
    },
    stopSound() {
      this.audio.pause();
      this.audio.currentTime = 0;
    },
    startFlashing() {
      this.flashingInterval = setInterval(() => {
        this.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      }, 500); // Change color every 500ms
      this.isFlashing = true;
    },
    stopFlashing() {
      clearInterval(this.flashingInterval);
      this.backgroundColor = '';
      this.isFlashing = false;
    },
    toggleFlashing() {
      if (this.isFlashing) {
        this.stopFlashing();
        this.stopSound();
      } else {
        this.startFlashing();
        this.playSound();
      }
    },
    startTimer() {
      this.isBreakTime = false;
      if (!this.timer) {
        this.timerState = 'running';
        this.timeLeft = this.timerState === 'onBreak' ? this.breakDuration : this.workDuration;
        this.timer = setInterval(() => {
          if (this.timeLeft > 0) {
            this.timeLeft--;
          } else {
            this.completeInterval();
          }
        }, 1000);
      }
      if (!this.isBreakTime && this.isFlashing) {
        this.playSound();
      }
    },
    stopTimer() {
      clearInterval(this.timer);
      this.timer = null;
      this.timerState = 'paused';
      this.stopSound();
    },
    completeInterval() {
      clearInterval(this.timer);
      this.timer = null;

      if (this.timerState === 'running') {
        this.completedPomodoros++;
        this.timerState = 'onBreak';
      } else {
        this.timerState = 'idle';
      }
      this.stopSound();
    },
  },
};
</script>

<style>
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

