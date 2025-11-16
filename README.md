# jluo0156_9103_majorproject
# Major Project

## Part 1: How to interact with the work

- **How to Interact with the Work**
This project uses the audio track’s loudness to control visual changes. While the sound is playing, the program measures the audio level in real time and applies it to the animation. The viewer only needs to press Play/Pause to start or stop the audio. 
Note: The audio may be loud in some sections.
The full track is approximately 30 seconds long.
- **Person screaming**
The main figure in the image scales up and down according to the loudness of the audio. Higher volume results in a larger scale value and visible shaking when the audio becomes louder.
- **Background Line Movement**
The background layers are reconstructed using line segments. These segments shift slightly each frame, and the amount of movement increases as the audio becomes louder.

### Summary
The sketch reacts directly to the audio level. The viewer interacts by pressing Play/Pause, and all visual changes—scaling, shaking, and line movement—are controlled by the real-time amplitude of the sound.




---




# Chosen Interaction Method: **Audio**

# Part 2: Differences with Group Members

- **Sound-Driven Visual Effects**  
  While my group members used time-based transitions (e.g., light-to-dark background changes), my animation is fully audio-driven. The background line segments shake according to the real-time sound amplitude instead of changing based on time.
- **Amplitude-Based Scaling of the Main Character**  
  Group member animated people walking on the bridge. In contrast, my focus is on the main figure. The character increases in size according to the loudness of the audio, scales between 1.0× and 2.8× depending on amplitude. And higher volume also adds body shaking through random positional offsets.
- **Layered Background Movement**  
  The background is divided into multiple layers. Each layer has its own shaking intensity: upper layers move more when the audio amplitude increases, while lower layers move less.




---


