![ccicon](https://github.com/timsayshey/cringe-clock/assets/1148940/bc70d876-d58f-4817-b844-d0f8af1c88c0)

# CringeClock

A pomodoro timer that refuses to be ignored. Built for people who get distracted easily.

**[Download for Windows, Mac, or Linux](https://github.com/timsayshey/cringe-clock/releases)**

## What is this

It's a pomodoro timer that flashes colors and makes noise. It stays on top of your other windows so you can't forget about it. The background changes color at a pace that slows down as your work session progresses.

### Demo

https://github.com/timsayshey/cringe-clock/assets/1148940/f3640db1-8730-45af-a67e-256b1661d692

### Features

- Always on top of other windows
- Flashing colors (be careful if you're sensitive to flashing lights)
- Multiple ticking sounds to choose from (or turn them off)
- Voice countdowns and encouragements
- Adjustable work/break durations
- Adjustable color change rate (BPM)

## Windows SmartScreen Warning

Windows will show a SmartScreen warning because the app isn't code-signed. Code signing certificates cost a few hundred dollars a year and this is a free project.

The app is open source, you can read all the code yourself. To run it anyway:

1. Click "More info" on the warning
2. Click "Run anyway"

Or just build it from source.

## Running locally

```sh
git clone https://github.com/timsayshey/cringe-clock.git
cd cringe-clock
npm install
npm start
```

## Building

```sh
npm run build-vue
npm run build-electron-mac    # or -windows or -linux
```

## Contributing

PRs welcome. Some things that would be nice:

- Mute button for flashing only (no sound)
- More annoying sounds
- Task list that persists between sessions

## License

MIT License
