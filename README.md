# WaaS - Whisper as a Service

GUI and API for [OpenAI Whisper](https://github.com/openai/whisper)

<div align="center">
  <img src="https://user-images.githubusercontent.com/195266/218677028-632f0a49-c089-486a-ad7f-418c07214876.png" />
  <video src="https://user-images.githubusercontent.com/544388/219612413-5e84183c-4ce0-4033-ae18-4e5dca740909.mov">No video support</video>
</div>
<br/>
<p align="center">
  <a href="https://github.com/schibsted/WAAS/graphs/contributors">
      <img src="https://img.shields.io/github/contributors/schibsted/WAAS?style=for-the-badge"/>
  </a>
  <a href="https://github.com/schibsted/WAAS/stargazers">
      <img src="https://img.shields.io/github/stars/schibsted/WAAS?style=for-the-badge"/>
  </a>
  <a href="https://github.com/schibsted/WAAS/network/members">
      <img src="https://img.shields.io/github/forks/schibsted/WAAS?style=for-the-badge"/>
  </a>
  <a href="https://github.com/schibsted/WAAS/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/schibsted/WAAS?style=for-the-badge" alt="WAAS is released under the Apache-2.0 license" />
  </a>
  <a href="https://github.com/schibsted/WAAS/issues?q=is:issue+sort:updated-desc+is:open">
    <img src="https://img.shields.io/github/issues-raw/schibsted/WAAS?style=for-the-badge" />
  </a>
  <a href="https://github.com/schibsted/WAAS/issues?q=is:issue+sort:updated-desc+is:closed">
    <img src="https://img.shields.io/github/issues-closed-raw/schibsted/WAAS?style=for-the-badge" />
  </a>
</p>

## What is Jojo?

Jojo is the frontend GUI for upload and transcribe a audio or video file. After the transcription is done you get an email with download links.
You can directly download a Jojo-file, SRT, or text from the email. Then you can upload a Jojo file to the frontend to come into an editor (see video).

WaaS is the backend and frontend as a whole.

### Editor

The editor works 100% locally in your browser. Here can you listen to segments and fix transcriptions errors. After you are done just save the Jojo-file to your desktop. An easy way to play the selected segment is by holding down the Control-key on the keyboard.

## This project started out by VG

<img src="https://imbo.vgc.no/s/rUWUC9P" />

## Project structure

The project is split into two parts, the frontend and the backend. The frontend is a Astro app and the backend is a Python Flask app.

Documentation for the frontend can be found in the [frontend](frontend/README.md) folder.

Documentation for the backend can be found in the [backend](backend/README.md) folder.

## TODO: Add docs for docker-compose and how to run the project locally
