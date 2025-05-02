<template>
  <v-container>
    <video
      ref="video"
      autoplay
      playsinline
      style="width: 50%; height: auto; border: 1px solid red"
    ></video>
  </v-container>
</template>

<script>
import { onMounted, ref } from "vue";

export default {
  setup() {
    const video = ref(null);
    const socket = ref(null);

    onMounted(async () => {
      const url = extractDomain(import.meta.env.VITE_REMOTE_HOST);
      // Open WebSocket connection
      socket.value = new WebSocket(`ws://${url}/ws/video/`);

      // Set up peer connection
      const pc = new RTCPeerConnection();

      // Set up video receiver
      pc.addTransceiver("video", { direction: "recvonly" });

      // Handle incoming video stream
      pc.ontrack = (event) => {
        console.log("Received track:", event.streams[0]); // Log the stream
        if (video.value) {
          video.value.srcObject = event.streams[0];
        }
      };

      // WebSocket opened
      socket.value.onopen = async () => {
        console.log("WebSocket connected.");

        // Create and send the offer only after WebSocket is open
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.value.send(
          JSON.stringify({
            sdp: pc.localDescription.sdp,
            type: pc.localDescription.type,
          })
        );
      };

      // Handle incoming answer from the server
      socket.value.onmessage = async (event) => {
        console.log("Received message:", event.data); // Log incoming message
        const data = JSON.parse(event.data);
        const answer = new RTCSessionDescription(data);
        await pc.setRemoteDescription(answer);
      };

      // Handle WebSocket errors and closure
      socket.value.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.value.onclose = () => {
        console.log("WebSocket connection closed.");
      };
    });

    return {
      video,
    };
  },
};
</script>
